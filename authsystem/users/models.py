from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model


# 🔹 Custom User with Role
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    REQUIRED_FIELDS = ['email', 'role']

    def __str__(self):
        return self.username


# 🔹 Cartridge Request Model
class CartridgeRequest(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    printer_id = models.CharField(max_length=100)
    printer_model = models.CharField(max_length=100)
    cartridge_model = models.CharField(max_length=100)
    date_of_requisition = models.DateField()
    status = models.CharField(max_length=50, default='Pending')  # 'Pending', 'Issued'
    issued_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.user.email})"


# 🔹 Cartridge Stock Model
class CartridgeStock(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100, unique=True)
    quantity = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.make} - {self.model} ({self.quantity})"


# ✅ 🔹 Stock Update Log Model with DateField
import random

class StockUpdateLog(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    quantity_added = models.IntegerField()
    updated_on = models.DateField(auto_now_add=True)
    po_number = models.CharField(max_length=25, editable=False, null=True) 

    class Meta:
        unique_together = ('make', 'model', 'updated_on')

    def save(self, *args, **kwargs):
        if not self.po_number:
            base = "GEMC-5116877"
            # Check if a PO already exists for this model & date
            existing = StockUpdateLog.objects.filter(
                make=self.make,
                model=self.model,
                updated_on=self.updated_on,
            ).exclude(pk=self.pk).first()

            if existing:
                self.po_number = existing.po_number
            else:
                random_part = ''.join([str(random.randint(0, 9)) for _ in range(8)])
                self.po_number = f"{base}{random_part}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.make} - {self.model}: +{self.quantity_added} on {self.updated_on}"