from django.contrib import admin
from core.models import Client, Case, Hearing, Notification, UserProfile, AdminLog

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'first_name', 'last_name', 'email', 'phone_number', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('civil_status', 'created_at')

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'case_title', 'client', 'status', 'priority', 'lawyer_assigned', 'created_at')
    search_fields = ('case_title', 'client__first_name', 'client__last_name')
    list_filter = ('status', 'priority', 'case_type', 'created_at')

@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ('hearing_id', 'case', 'hearing_date', 'hearing_type', 'status')
    search_fields = ('case__case_title', 'judge_name')
    list_filter = ('status', 'hearing_type', 'hearing_date')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('notification_id', 'user', 'title', 'type', 'is_read', 'created_at')
    search_fields = ('title', 'message')
    list_filter = ('type', 'is_read', 'created_at')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'django_user', 'role', 'phone_number', 'is_active')
    search_fields = ('django_user__username', 'django_user__email')
    list_filter = ('role', 'is_active', 'created_at')

@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'user_id', 'action', 'table_name', 'created_at')
    search_fields = ('user_id', 'action', 'table_name')
    list_filter = ('action', 'table_name', 'created_at')
    readonly_fields = ('created_at',)
