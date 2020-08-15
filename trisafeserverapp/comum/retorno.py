from django.forms.models import model_to_dict
from django.db.models.query import QuerySet
from django.db import models
from comum.credencial import Credencial
import json

class Retorno:
                        
    def __init__(self, ind_ok = False, msg = '', codMensagem = '', httpStatus = 500, ex = None, credencial = None):        
        self.estado = EstadoExecucao(ind_ok, msg, codMensagem, httpStatus, ex)
        self.dados = None
        self.credencial = Credencial()
        if(credencial):
            self.credencial = credencial
        
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