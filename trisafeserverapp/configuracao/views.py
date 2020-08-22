import mimetypes
from datetime import datetime
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from gerenciadorlog.models import GerenciadorLog
from contrato.models import Contrato
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
from comum.credencial import Credencial
from configuracao.models import Configuracao
import json
import traceback
import sys

# Create your views here.
class ConfiguracaoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = GerenciadorLog
        fields = ()

# ViewSets define the view behavior.
class ConfiguracaoViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = ConfiguracaoSerializer
    
    @action(detail=False, methods=['post'])
    def configurar_credenciais(self, request):
        try:
            
            credencial_cliente = self.apropriar_credenciais_http(request)
            configuracao = Configuracao(credencial_cliente)

            return Response(configuracao.retorno_autenticacao.json())
            
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @classmethod
    def apropriar_credenciais_http(cls, request):
        chave_trisafe = ''
        credencial_secundaria = ''

        if 'chaves' in request.data:
            d_chaves = request.data['chaves']
            chave_trisafe = d_chaves['chave_trisafe']
            credencial_secundaria = d_chaves['credencial_secundaria']

        credencial = Credencial(chave_trisafe, '')
        credencial.credencial_trisafe_cripto_secundaria = credencial_secundaria

        return credencial