import mimetypes
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from emailcliente.models import EmailCliente
from gerenciadorlog.views import GerenciadorLogViewSet
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
class EmailClienteViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = EmailClienteSerializer
    
    @action(detail=False, methods=['post'])
    def enviar_com_anexos(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)
            
            m_email_cliente = EmailCliente()
            
            m_contrato = EmailClienteViewSet.apropriar_dados_http(request)
            
            retorno = m_email_cliente.enviar_com_anexos(m_contrato)
            
            return Response(retorno.json())
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @classmethod
    def apropriar_dados_http(cls, request):
        m_contrato = Contrato()
        
        d_dados_app = request.data['dados_app']
        d_contrato = d_dados_app['contrato']
        m_contrato.id_contrato = d_contrato['id_contrato']

        return m_contrato