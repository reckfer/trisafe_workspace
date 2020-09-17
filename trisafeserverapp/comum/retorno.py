from django.forms.models import model_to_dict
from django.db.models.query import QuerySet
from django.db import models
from rest_framework.response import Response
from comum.credencial import Credencial
import json
import traceback
import logging
import sys

logger_servidor_app_fluxo = logging.getLogger('servidor.app.fluxo')

class Retorno:
                        
    def __init__(self, ind_ok = False, msg = '', codMensagem = '', httpStatus = 500, ex = None, credencial = None):        
        self.estado = EstadoExecucao(ind_ok, msg, codMensagem, httpStatus, ex)
        self.dados = None
        self.credencial = Credencial()
        if(credencial):
            self.credencial = credencial
    
    def gerar_resposta_http(self):
        if not self.estado.ok:
            logger_servidor_app_fluxo.error('Resposta: %s' % self.estado.json())
        else:
            if logger_servidor_app_fluxo.isEnabledFor(logging.DEBUG):
                logger_servidor_app_fluxo.debug('Resposta (dados): %s' % self.json())
            else:
                logger_servidor_app_fluxo.info('Resposta: %s' % self.estado.json())

        return Response(self.json())
        
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        oDados = self.dados
        
        if isinstance(self.dados, QuerySet):
            oDados = list(self.dados.values())
        elif isinstance(self.dados, models.Model):
            oDados = self.dados.json()
            
        ret = {
            "estado": self.estado.json(),
            "dados": oDados,
            "credencial": self.credencial.json()
            }
        return ret
    
    def __str__(self):
        return json.dumps(self.__criar_json__())

class EstadoExecucao:
    def __init__(self, indOK = False, msg = '', codMensagem = '', httpStatus = 500, ex = None):
        self.ok = indOK
        self.mensagem = msg
        self.codMensagem = codMensagem
        self.excecao = ex
        
        if self.ok:            
            self.httpStatus = 200
        else:
            self.httpStatus = httpStatus

        if (self.excecao):
            if httpStatus >= 200 and httpStatus < 400:
                self.httpStatus = 500
            
            if(not self.codMensagem or len(self.codMensagem) == 0):
                self.codMensagem = 'Excecao'
            
            if(not self.mensagem or len(self.mensagem) == 0):
                self.mensagem = 'Falha de comunicação. Em breve será normalizado.'

            logger_servidor_app_fluxo.exception('%s %s' % (self.mensagem, traceback.format_exception(None, self.excecao, self.excecao.__traceback__)))
            
            self.mensagem = 'Falha de comunicação. Em breve será normalizado.'
            
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        ret = {
            "ok": self.ok,
            "mensagem": self.mensagem,
            "cod_mensagem": self.codMensagem,
            "http_status": self.httpStatus
            }
        return ret

    def __str__(self):
        return json.dumps(self.__criar_json__())