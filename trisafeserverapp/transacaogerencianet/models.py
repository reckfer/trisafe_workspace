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
    
    def incluir(self, d_dados_pedido):
        try:
            m_gerencia_net = Gerencianet(credentials)

            d_charge = m_gerencia_net.create_charge(body=d_dados_pedido)
            self.converter_de_gerencia_net(d_charge)
            
            retorno = Retorno(True)
            retorno.dados = self

            return retorno

        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno

    def converter_de_gerencia_net(self, d_charge):
        if d_charge:
            d_dados_charge = d_charge['data']
            self.id = d_dados_charge['charge_id']
            self.data_criacao = d_dados_charge['created_at']
            self.estado = d_dados_charge['status']
            self.total = d_dados_charge['total']

    def json(self):
        return self.__criar_json__()

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