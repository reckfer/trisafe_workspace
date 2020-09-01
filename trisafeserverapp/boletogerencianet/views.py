from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from boletogerencianet.models import BoletoGerenciaNet
from gerenciadorlog.views import GerenciadorLogViewSet
from autenticacaotrisafe.views import AutenticacaoTriSafeViewSet
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
from contrato.models import Contrato
from cliente.models import Cliente
import json
import traceback
import sys

class BoletoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = BoletoGerenciaNet
        fields = ('charge_id')

# ViewSets define the view behavior.
class BoletoViewSet(AutenticacaoTriSafeViewSet, viewsets.ModelViewSet, permissions.BasePermission):
    queryset = BoletoGerenciaNet.objects.all()
    serializer_class = BoletoSerializer
    
    @action(detail=False, methods=['post'])
    def gerar(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_boleto = BoletoGerenciaNet()
            
            m_contrato = self.apropriar_dados_http(request)
            
            retorno_boleto = m_boleto.gerar(m_contrato)

            return Response(retorno_boleto.json())
            
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())
    
    @action(detail=False, methods=['post'])
    def obter(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)
            
            m_boleto = BoletoGerenciaNet()
            
            m_contrato = self.apropriar_dados_http(request)
            
            retorno_boleto = m_boleto.obter(m_contrato)

            return Response(retorno_boleto.json())
            
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())
    
    @classmethod
    def apropriar_dados_http(cls, request):
        m_contrato = Contrato()
        m_cliente = Cliente()
        m_contrato.cliente = m_cliente

        d_dados_app = request.data['dados_app']        
        d_contrato = d_dados_app['contrato']
        d_cliente = d_dados_app['cliente']

        m_cliente.cpf = d_cliente['cpf']
        m_contrato.id_contrato = d_contrato['id_contrato']

        return m_contrato