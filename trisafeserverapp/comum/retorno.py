from django.forms.models import model_to_dict
from django.db.models.query import QuerySet
from django.db import models
from rest_framework.response import Response
import json
import traceback
import logging
import sys

class Retorno:
                        
    def __init__(self, ind_ok = False, objeto_atual = None, msg = '', codMensagem = '', httpStatus = 500, ex = None):
        self.estado = EstadoExecucao(ind_ok, msg, codMensagem, httpStatus, ex)
        self.dados = None
        self.objeto_atual = objeto_atual
        self.credencial = None
    
    def gerar_resposta_http(self):
        self.objeto_atual.registrar_retorno_ao_cliente(self)

        return Response(self.json())
        
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        oDados = self.dados

        if self.dados:
            if isinstance(self.dados, QuerySet):
                lista_objetos = self.dados
                ##.values()

                oDados = []
                for objeto in lista_objetos:
                    oDados.append(objeto.json())

            elif isinstance(self.dados, models.Model) or (isinstance(self.dados, object) and not isinstance(self.dados, dict)):
                oDados = self.dados.json()

        chaves = ''
        if self.credencial:
            chaves = self.credencial.json()
        else:
            token_trisafe = ''
            token_iter = ''
            token_clicksign = ''

            if (self.objeto_atual.credencial_trisafe and self.objeto_atual.credencial_trisafe.token_trisafe):
                token_trisafe = self.objeto_atual.credencial_trisafe.token_trisafe

            if (self.objeto_atual.credencial_clicksign and self.objeto_atual.credencial_clicksign.token_clicksign):
                token_clicksign = self.objeto_atual.credencial_clicksign.token_clicksign

            if (self.objeto_atual.credencial_iter and self.objeto_atual.credencial_iter.token_iter):
                token_iter = self.objeto_atual.credencial_iter.token_iter

                chaves = {
                    # Atribui token_trisafe criptografado.
                    "token_trisafe": token_trisafe,
                    # Atribui token_iter criptografado.
                    "token_iter": token_iter,
                    # Atribui token_clicksign criptografado.
                    "token_clicksign": token_clicksign
                }
            

        ret = {
            "estado": self.estado.json(),
            "dados": oDados,
            "chaves": chaves
            }
        return ret
    
    def __str__(self):
        return json.dumps(self.__criar_json__())

class EstadoExecucao:
    def __init__(self, indOK = False, msg = '', codMensagem = '', httpStatus = 500, ex = None):
        self.ok = indOK
        self.mensagem = msg
        self.mensagemServidor = ''
        self.codMensagem = codMensagem
        self.excecao = ex
        
        if self.ok:            
            self.httpStatus = 200
            self.mensagemServidor = 'Retorno OK. %s' % (msg)
        else:
            self.httpStatus = httpStatus
            self.mensagemServidor = 'Retorno com Erro. %s' % (msg)
            
        if (self.excecao):
            self.codMensagem = 'Excecao'
            self.mensagem = 'Falha no processamento da solicitação. Em breve será normalizado.'
            self.mensagemServidor = 'Retorno com Excecao. %s %s' % (self.mensagem, msg)

            if httpStatus and (httpStatus >= 200 and httpStatus < 400):
                self.httpStatus = 500

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