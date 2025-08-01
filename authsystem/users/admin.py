from django.contrib import admin
from .models import CustomUser, CartridgeRequest, CartridgeStock, StockUpdateLog
from django.contrib.auth.admin import UserAdmin

# Custom User
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )

# Cartridge Request
@admin.register(CartridgeRequest)
class CartridgeRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'cartridge_model', 'status', 'issued_date', 'user')
    list_filter = ('status', 'issued_date')
    search_fields = ('name', 'cartridge_model', 'user__email')

# Cartridge Stock
@admin.register(CartridgeStock)
class CartridgeStockAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'quantity')
    search_fields = ('make', 'model')

# ✅ Register Stock Update Log
@admin.register(StockUpdateLog)
class StockUpdateLogAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'quantity_added', 'updated_on')
    list_filter = ('model', 'updated_on')
    search_fields = ('make', 'model')
