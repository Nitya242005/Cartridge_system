from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth import authenticate
from datetime import date

from .models import CartridgeRequest, CartridgeStock, StockUpdateLog
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CartridgeRequestSerializer,
    CartridgeRequestAdminViewSerializer,
    CartridgeRequestUserViewSerializer,
    CartridgeStockSerializer,
    CustomTokenObtainPairSerializer,
    StockUpdateLogSerializer,
)

# 🔹 Register New User
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 🔹 Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response({
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "token": access_token,
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 🔹 Save Cartridge Request (User)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_cartridge_request(request):
    serializer = CartridgeRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({'message': 'Request saved successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 🔹 Get All Requests (Admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_cartridge_requests(request):
    requests = CartridgeRequest.objects.select_related('user').filter(status="Pending")
    serializer = CartridgeRequestAdminViewSerializer(requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔹 Get User’s Own Requests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_cartridge_requests(request):
    requests = CartridgeRequest.objects.filter(user=request.user)
    serializer = CartridgeRequestUserViewSerializer(requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔹 Delete a Request (User)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cartridge_request(request, pk):
    try:
        request_obj = CartridgeRequest.objects.get(pk=pk, user=request.user)
        request_obj.delete()
        return Response({'message': 'Request deleted successfully'}, status=status.HTTP_200_OK)
    except CartridgeRequest.DoesNotExist:
        return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

# 🔹 Accept Request (Admin) and Reduce Stock
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_cartridge_request(request, request_id):
    try:
        cartridge_request = CartridgeRequest.objects.get(id=request_id)
        stock = CartridgeStock.objects.get(model=cartridge_request.cartridge_model)

        if stock.quantity > 0:
            stock.quantity -= 1
            stock.save()

            cartridge_request.status = "Issued"
            cartridge_request.issued_date = date.today()
            cartridge_request.save()

            return Response({'message': 'Request accepted and stock updated.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Not enough stock available.'}, status=status.HTTP_400_BAD_REQUEST)

    except CartridgeRequest.DoesNotExist:
        return Response({'error': 'Cartridge request not found.'}, status=status.HTTP_404_NOT_FOUND)
    except CartridgeStock.DoesNotExist:
        return Response({'error': 'Cartridge stock not found for this model.'}, status=status.HTTP_404_NOT_FOUND)

# 🔹 Get All Accepted Requests (Admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_accepted_requests(request):
    accepted = CartridgeRequest.objects.filter(status="Issued")
    serializer = CartridgeRequestAdminViewSerializer(accepted, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔹 View All Cartridge Stock
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cartridge_stock(request):
    stock = CartridgeStock.objects.all()
    serializer = CartridgeStockSerializer(stock, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔹 Add New Stock Entry
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_cartridge_stock(request):
    serializer = CartridgeStockSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Cartridge stock added successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ 🔹 Update Stock Quantity + Merge Same Day Logs
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_cartridge_stock_quantity(request, stock_id):
    try:
        stock = CartridgeStock.objects.get(id=stock_id)
        new_qty_raw = request.data.get("quantity")

        try:
            new_qty = int(new_qty_raw)
        except (ValueError, TypeError):
            return Response({'error': 'Quantity must be a valid number.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_qty < 0:
            return Response({'error': 'Quantity cannot be negative.'}, status=status.HTTP_400_BAD_REQUEST)

        qty_diff = new_qty - stock.quantity
        if qty_diff > 0:
            today = date.today()
            log_entry, created = StockUpdateLog.objects.get_or_create(
                make=stock.make,
                model=stock.model,
                updated_on=today,
                defaults={'quantity_added': qty_diff}
            )
            if not created:
                log_entry.quantity_added += qty_diff
                log_entry.save()

        stock.quantity = new_qty
        stock.save()
        return Response({'message': 'Quantity updated successfully'}, status=status.HTTP_200_OK)

    except CartridgeStock.DoesNotExist:
        return Response({'error': 'Stock item not found'}, status=status.HTTP_404_NOT_FOUND)

# 🔹 Delete Stock Record
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cartridge_stock(request, stock_id):
    try:
        stock = CartridgeStock.objects.get(id=stock_id)
        stock.delete()
        return Response({'message': 'Cartridge stock deleted successfully.'}, status=status.HTTP_200_OK)
    except CartridgeStock.DoesNotExist:
        return Response({'error': 'Stock not found.'}, status=status.HTTP_404_NOT_FOUND)

# 🔹 Get All Stock Quantity Updates (Logs)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stock_update_logs(request):
    logs = StockUpdateLog.objects.all().order_by('-updated_on')
    serializer = StockUpdateLogSerializer(logs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔹 Custom JWT Token View
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer  


