import json
import sys
import traceback
from datetime import date
from django.db import models
from rest_framework import status
from comum.retorno import Retorno
from gerencianet import Gerencianet

credentials = {
    'client_id': 'Client_Id_add8181cd3a52a8343ca8912c17bebf2acc579ae',
    'client_secret': 'Client_Secret_8c2e0c711440ccb2ca969115cb9322d697cf02da',
    'sandbox': True
}

class TransacaoGerenciaNet(models.Model):
    
    def __init__(self):
        self.id = None
        self.data_criacao = None
        self.estado = None
        self.total = None

    def incluir(self, d_dados_pedido):
        try:
            m_gerencia_net = Gerencianet(credentials)

            d_charge = m_gerencia_net.create_charge(body=d_dados_pedido)
            retorno = self.tratar_retorno_gerencia_net(d_charge)
            
            retorno.dados = self

            return retorno

        except Exception as e:
                    
            retorno = Retorno(False, 'A inclusão de transação para boleto falhou.', None, None, e)
            return retorno

    def converter_de_gerencia_net(self, d_dados_charge):

        if d_dados_charge:
            self.id = d_dados_charge['charge_id']
            self.data_criacao = d_dados_charge['created_at']
            self.estado = d_dados_charge['status']
            self.total = d_dados_charge['total']

    def json(self):
        return self.__criar_json__()
    
    def tratar_retorno_gerencia_net(self, d_charge):
        retorno = Retorno(True)

        if d_charge:
            if 'error_description' in d_charge:
                d_error = d_charge['error_description']
                msg_erro = d_error

                if 'message' in d_error:
                    msg_erro = d_error['message']

                if(d_error):
                    retorno = Retorno(False, msg_erro, d_charge['error'])
                    return retorno
                    
            elif 'data' in d_charge:
                d_dados_charge = d_charge['data']
                if d_dados_charge:
                    self.converter_de_gerencia_net(d_dados_charge)
                else:
                    retorno = Retorno(False, 'Os dados de geração do boleto foram retornados vazios.')

        else:
            retorno = Retorno(False, 'O objeto retornado na geração do boleto está vazio.')

        return retorno
        

    def __criar_json__(self):
        ret = {
            "id": self.id,
            "data_criacao": self.data_criacao,
            "estado": self.estado,
            "total": self.total
            }
        return ret

    def __str__(self):
        return self.id