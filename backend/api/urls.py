from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('cases/', views.CaseListView.as_view(), name='case_list'),
    path('cases/<int:case_id>/', views.CaseDetailView.as_view(), name='case_detail'),
    path('clients/', views.ClientListView.as_view(), name='client_list'),
    path('clients/<int:client_id>/', views.ClientDetailView.as_view(), name='client_detail'),
    path('hearings/', views.HearingListView.as_view(), name='hearing_list'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
]
