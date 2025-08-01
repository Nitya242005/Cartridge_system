from django.urls import path
from .views import (
    RegisterView, LoginView,
    save_cartridge_request,
    get_all_cartridge_requests, get_user_cartridge_requests, delete_cartridge_request,
    accept_cartridge_request, get_accepted_requests,
    get_cartridge_stock, add_cartridge_stock,
    update_cartridge_stock_quantity, delete_cartridge_stock,
    get_stock_update_logs  # ✅ NEW IMPORT
)

urlpatterns = [
    # 🔐 Auth
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),

    # 📝 Requests
    path('save-request/', save_cartridge_request),
    path('admin/requests/', get_all_cartridge_requests),
    path('user/requests/', get_user_cartridge_requests),
    path('user/requests/<int:pk>/delete/', delete_cartridge_request),

    # ✅ Accept and view accepted
    path('admin/requests/<int:request_id>/accept/', accept_cartridge_request),
    path('admin/requests/accepted/', get_accepted_requests),

    # 📦 Cartridge Stock
    path('admin/stock/', get_cartridge_stock),
    path('admin/stock/add/', add_cartridge_stock),
    path('admin/stock/<int:stock_id>/update/', update_cartridge_stock_quantity),
    path('admin/stock/<int:stock_id>/delete/', delete_cartridge_stock),

    # 🔄 Stock Update Logs (➡️ for "Updated Quantity" section)
    path('admin/stock-updates/', get_stock_update_logs),  # ✅ NEW LINE
]
