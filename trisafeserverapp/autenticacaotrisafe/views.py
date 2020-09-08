import mimetypes
from datetime import datetime
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from django.db import models
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.request import Request, HttpRequest
from rest_framework.response import Response
from rest_framework import mixins
from rest_framework.renderers import JSONRenderer
from contrato.models import Contrato
from comum.retorno import Retorno
from comum.credencial import Credencial
from autenticacaotrisafe.models import AutenticacaoTriSafe
from autenticacaotrisafe.models import ExceptionAutenticacaoTriSafe
import json
import traceback
import sys
import logging
from django_wsgi import middleware

logger_servidor_app_fluxo = logging.getLogger('servidor.app.fluxo')

# Create your views here.
class AutenticacaoTriSafeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = AutenticacaoTriSafe
        fields = ()

# ViewSets define the view behavior.
class AutenticacaoTriSafeViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = AutenticacaoTriSafeSerializer

    # Sobrescreve para fazer autenticacao com a Trisafe.
    def initial(self, request, *args, **kwargs):
        logger_servidor_app_fluxo.warning('Iniciando autenticacao Trisafe')
        init = super().initial(request, *args, **kwargs)

        if not (request.stream.path == '/autenticacoestrisafe/autenticar_cliente/'):
            credencial_cliente = self.apropriar_credenciais_http(request)
            configuracao = AutenticacaoTriSafe(credencial_cliente)

            if not configuracao.retorno_autenticacao.estado.ok:
                raise ExceptionAutenticacaoTriSafe(configuracao.retorno_autenticacao.estado.mensagem)

        return init

    # Sobrescreve para capturar erros de autenticacao com a Trisafe.
    def handle_exception(self, exc):
        if (exc and isinstance(exc, ExceptionAutenticacaoTriSafe)):
            mensagem = ''
            if exc and len(exc.args) > 0:
                mensagem = exc.args[0]

            retorno = Retorno(False, mensagem, '', 401, exc)

            return Response(retorno.json())

        super().handle_exception(exc)

    @action(detail=False, methods=['post'])
    def autenticar_cliente(self, request):
        try:
            
            credencial_cliente = self.apropriar_credenciais_http(request)
            configuracao = AutenticacaoTriSafe(credencial_cliente)

            return Response(configuracao.retorno_autenticacao.json())
            
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @classmethod
    def apropriar_credenciais_http(cls, request):
        chave_trisafe = ''
        token_trisafe = ''
        credencial_secundaria = ''
        dados = request.data

        if 'dados_app' in request.data:
            dados = request.data['dados_app']

        if 'chaves' in dados:
            d_chaves = dados['chaves']
            chave_trisafe = d_chaves['chave_trisafe']
            token_trisafe = d_chaves['token_trisafe']
            if('credencial_secundaria' in d_chaves):
                credencial_secundaria = d_chaves['credencial_secundaria']

        credencial = Credencial(chave_trisafe, '')
        credencial.token_trisafe = token_trisafe.encode()
        credencial.credencial_trisafe_cripto_secundaria = credencial_secundaria

        return credencial