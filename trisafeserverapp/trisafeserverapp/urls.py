"""trisafeserverapp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from django.contrib import admin
from django.conf.urls import url
from cliente.views import ClienteViewSet
from produto.views import ProdutoViewSet
from boletogerencianet.views import BoletoViewSet
from contrato.views import ContratoViewSet
from emailcliente.views import EmailClienteViewSet
from django.conf.urls import url, include
from rest_framework import routers

# # Serializers define the API representation.
# class ClienteSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = Cliente
#         fields = ('nome', 'endereco')

# # ViewSets define the view behavior.
# class ClienteViewSet(viewsets.ModelViewSet):
#     queryset = Cliente.objects.all()
#     serializer_class = ClienteSerializer

# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'clientes/incluir/', ClienteViewSet)
router.register(r'clientes/obter_ultimo/', ClienteViewSet)
router.register(r'produtos', ProdutoViewSet)
router.register(r'produtos/listar', ProdutoViewSet)
router.register(r'produtos/contratar', ProdutoViewSet)
router.register(r'contratos', ContratoViewSet)
router.register(r'contratos/incluir/', ContratoViewSet)
router.register(r'contratos/aceitar/', ContratoViewSet)
router.register(r'contratos/obter/', ContratoViewSet)
router.register(r'contratos/obter_arquivo_contrato/', ContratoViewSet)
router.register(r'contratos/obter_por_cliente/', ContratoViewSet)
router.register(r'boletogerencianets', BoletoViewSet)
router.register(r'boletogerencianets/obter/', BoletoViewSet)
router.register(r'boletogerencianets/gerar/', BoletoViewSet)
router.register(r'emailclientes', EmailClienteViewSet)
router.register(r'emailclientes/enviar_com_anexos/', EmailClienteViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    
]

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]