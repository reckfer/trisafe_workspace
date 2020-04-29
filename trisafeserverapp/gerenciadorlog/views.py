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
import json
import traceback
import sys

# Create your views here.
class GerenciadorLogSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = GerenciadorLog
        fields = ()

# ViewSets define the view behavior.
class GerenciadorLogViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all() # Adequar esta queryset
    serializer_class = GerenciadorLogSerializer
    
    @action(detail=False, methods=['post'])
    def registrar_do_cliente(self, request):
        try:
            retorno = Retorno(True)
            if 'registros_log' in request.data:
                m_gerenciador_log = GerenciadorLog('')
                
                d_registros_log = request.data['registros_log']
            
                if(len(d_registros_log) > 0):
                    data_hora = datetime.now()

                    d_registro_inicial = [{
                        'data_hora' : '',
                        'mensagem_log' : ''
                    }, 
                    {
                        'data_hora' : '',
                        'mensagem_log' : '++++++++  REGISTROS DO CLIENTE +++++++'
                    }]
                    retorno = m_gerenciador_log.registrar(d_registro_inicial)
                    
                    retorno = m_gerenciador_log.registrar(d_registros_log)

                    d_registro_final = [
                    {
                        'data_hora' : '',
                        'mensagem_log' : '++++++++  FIM DOS REGISTROS DO CLIENTE +++++++'
                    },
                    {
                        'data_hora' : '',
                        'mensagem_log' : ''
                    }]
                    retorno = m_gerenciador_log.registrar(d_registro_final)
            
            return Response(retorno.json())
            
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '')
            return Response(retorno.json())