import mimetypes
from datetime import datetime
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework import mixins
from gerenciadorlog.models import GerenciadorLog
from contrato.models import Contrato
from rest_framework.renderers import JSONRenderer
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

# Get an instance of a logger
logger_servidor_app_fluxo = logging.getLogger('servidor.app.fluxo')

# ViewSets define the view behavior.
class GerenciadorLogViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = GerenciadorLogSerializer
    
    @action(detail=False, methods=['post'])
    def registrar_do_cliente(self, request):
        try:
            logger_servidor_app_fluxo.debug('iniciou')

            retorno = Retorno(True)
            if 'registros_log' in request.data:
                m_gerenciador_log = GerenciadorLog()
                
                d_registros_log = request.data['registros_log']
            
                if(len(d_registros_log) > 0):

                    d_registro_inicial = [{
                        'data_hora' : '',
                        'mensagem_log' : ''
                    },
                    {
                        'data_hora' : '',
                        'mensagem_log' : '++++++++ REGISTROS DO CLIENTE - INICIO +++++++'
                    },
                    {
                        'data_hora' : '',
                        'mensagem_log' : ''
                    }]
                    retorno = m_gerenciador_log.registrar(d_registro_inicial)
                    
                    retorno = m_gerenciador_log.registrar(d_registros_log)
                    
                    d_registro_final = [{
                        'data_hora' : '',
                        'mensagem_log' : ''
                    },
                    {
                        'data_hora' : '',
                        'mensagem_log' : '-------- REGISTROS DO CLIENTE - FIM --------'
                    },
                    {
                        'data_hora' : '',
                        'mensagem_log' : ''
                    }]
                    retorno = m_gerenciador_log.registrar(d_registro_final)
            
            logger_servidor_app_fluxo.debug('finalizou')

            return retorno.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, 'O registro de log do cliente falhou.', None, None, e)
            return retorno.gerar_resposta_http()