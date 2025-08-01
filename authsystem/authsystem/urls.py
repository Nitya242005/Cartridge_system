from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView  # ✅ Custom JWT View

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # App routes
    path('api/', include('users.urls')),

    # ✅ Custom JWT token login (includes username & email)
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
