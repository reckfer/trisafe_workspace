import mimetypes
from datetime import datetime
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework import mixins
from contrato.models import Contrato
from rest_framework.renderers import JSONRenderer

from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno
import json
import traceback
import sys
import logging

# Create your views here.
class GerenciadorLogSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = GerenciadorLog
        fields = ()

# ViewSets define the view behavior.
class GerenciadorLogViewSet(viewsets.ModelViewSet, permissions.BasePermission, GerenciadorLog):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = GerenciadorLogSerializer
    
    # Sobrescreve para fazer autenticacao com a Trisafe.
    def initial(self, request, *args, **kwargs):
        init = super().initial(request, *args, **kwargs)
      
        self.inicializar_contexto(request)
        
        return init

    # Sobrescreve para capturar erros de autenticacao com a Trisafe.
    def handle_exception(self, exc):

        mensagem = ''
        if exc and len(exc.args) > 0:
            mensagem = exc.args[0]
        
        response = super().handle_exception(exc)

        retorno = Retorno(False, self, mensagem, '', response.status_code, exc)

        return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def registrar_do_cliente(self, request):
        try:
            retorno = Retorno(True, self)

            if 'registros_log' in request.data:
                d_registros_log = request.data['registros_log']
            
            m_gerenciador_log = self.definir_contexto(GerenciadorLog())
        
            retorno = m_gerenciador_log.registrar_do_cliente(d_registros_log)
            
            return retorno.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'O registro de log do cliente falhou.', None, None, e)
            return retorno.gerar_resposta_http()