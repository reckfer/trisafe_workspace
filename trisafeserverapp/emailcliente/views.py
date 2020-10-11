import mimetypes
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from emailcliente.models import EmailCliente
from autenticacaotrisafe.views import AutenticacaoTriSafeViewSet
from contrato.models import Contrato
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
import json
import traceback
import sys

# Create your views here.
class EmailClienteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = EmailCliente
        fields = ()

# ViewSets define the view behavior.
class EmailClienteViewSet(AutenticacaoTriSafeViewSet, viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = EmailClienteSerializer
    
    @action(detail=False, methods=['post'])
    def enviar_com_anexos(self, request):
        try:
            m_email_cliente = self.definir_contexto(EmailCliente())
            
            m_contrato = EmailClienteViewSet.apropriar_dados_http(request)
            self.definir_contexto(m_contrato)

            retorno = m_email_cliente.enviar_com_anexos(m_contrato)
            
            return retorno.gerar_resposta_http()
        except Exception as e:
                    
            retorno = Retorno(False, None, None, None, e)
            return retorno.gerar_resposta_http()

    @classmethod
    def apropriar_dados_http(cls, request):
        m_contrato = Contrato()
        
        d_dados_app = request.data
        d_contrato = d_dados_app['contrato']
        m_contrato.id_contrato = d_contrato['id_contrato']

        return m_contrato