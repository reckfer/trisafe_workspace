from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from boleto.models import BoletoGerenciaNet
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
import json
import traceback
import sys

class BoletoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = BoletoGerenciaNet
        fields = ('charge_id')

# ViewSets define the view behavior.
class BoletoViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = BoletoGerenciaNet.objects.all()
    serializer_class = BoletoSerializer
    
    @action(detail=False, methods=['post'])
    def gerar_boleto(self, request):
        try:
            m_boleto = BoletoGerenciaNet()
            
            retorno_boleto = m_boleto.gerar()
            return Response(retorno_boleto.json())
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '')
            return Response(retorno.json())
    
    @classmethod
    def apropriar_dados_http_chave(cls, request):
        m_boleto = BoletoGerenciaNet()
        m_boleto.cpf = request.data['cpf']
        m_boleto.email = request.data['email']

        return m_boleto

    @classmethod
    def apropriar_dados_http(cls, request):
        m_boleto = BoletoViewSet.apropriar_dados_http_chave(request)
        
        m_boleto.rg = request.data['cpf']
        m_boleto.nome = request.data['nome']
        m_boleto.nome_usuario = request.data['nome_usuario']
        
        return m_boleto