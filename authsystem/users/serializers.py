from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import CustomUser, CartridgeRequest, CartridgeStock, StockUpdateLog
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# 🔹 1. Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

# 🔹 2. Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")

# 🔹 3. Cartridge Request Serializer (for user submission)
class CartridgeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartridgeRequest
        fields = [
            'name', 'designation', 'department',
            'printer_id', 'printer_model', 'cartridge_model',
            'date_of_requisition'
        ]

# 🔹 4. Admin View Serializer (view all requests + status + issued date)
class CartridgeRequestAdminViewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CartridgeRequest
        fields = [
            'id', 'username', 'email', 'name', 'designation', 'department',
            'printer_id', 'printer_model', 'cartridge_model',
            'date_of_requisition', 'status', 'issued_date'
        ]

# 🔹 5. User View Serializer (shows submitted request with status)
class CartridgeRequestUserViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartridgeRequest
        fields = [
            'id', 'name', 'designation', 'department',
            'printer_id', 'printer_model', 'cartridge_model',
            'date_of_requisition', 'status', 'issued_date'
        ]

# 🔹 6. JWT Token Response Customization
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['role'] = self.user.role
        return data

# 🔹 7. Cartridge Stock Serializer (used in Stock tab)
class CartridgeStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartridgeStock
        fields = ['id', 'make', 'model', 'quantity']

# 🔹 8. ✅ Stock Update Log Serializer (for 'Updated Quantity' section)
# 🔹 8. ✅ Stock Update Log Serializer (for 'Updated Quantity' section)
class StockUpdateLogSerializer(serializers.ModelSerializer):
    updated_on = serializers.DateField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = StockUpdateLog
        fields = ['make', 'model', 'quantity_added', 'updated_on', 'po_number']
