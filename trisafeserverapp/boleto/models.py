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

class BoletoGerenciaNet(models.Model):
    
    def gerar(self, m_contrato):
        try:
            # t = TransacaoGerenciaNet()
            
            # retorno = t.incluir()
            # if not retorno.estado.ok:
            #     return retorno

            today = date.today()

            data_vencimento = today.strftime("%Y-%m-%d")
 
            params = {
                'id': m_contrato.charge_id
            }
            
            body = {
                'payment': {
                    'banking_billet': {
                        'expire_at': data_vencimento,
                        'customer': {
                            'name': m_contrato.cliente.nome,
                            'email': m_contrato.cliente.email,
                            'cpf': m_contrato.cliente.cpf,
                            # 'birth': m_contrato.cliente.,
                            'phone_number': m_contrato.cliente.telefone
                        }
                    }
                }
            }
            m_gerencia_net = Gerencianet(credentials)
            d_billet = m_gerencia_net.pay_charge(params=params, body=body)

            retorno = self.tratar_retorno_gerencia_net(d_billet)

            return retorno

        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno

    def tratar_retorno_gerencia_net(self, d_billet):
        retorno = Retorno(True)

        if d_billet:
            if 'error_description' in d_billet:
                d_error = d_billet['error_description']
                msg_erro = d_error

                if 'message' in d_error:
                    msg_erro = d_error['message']

                if(d_error):
                    retorno = Retorno(False, msg_erro, d_billet['error'])
                    return retorno
                    
            elif 'data' in d_billet:
                m_dados_boleto = d_billet['data']
                if m_dados_boleto:
                    self.converter_de_gerencia_net(m_dados_boleto)
                else:
                    retorno = Retorno(False, 'Os dados de geração do boleto foram retornados vazios.')

        else:
            retorno = Retorno(False, 'O objeto retornado na geração do boleto está vazio.')

        return retorno

    def converter_de_gerencia_net(self, m_dados_boleto):
        if m_dados_boleto:
            if 'pdf' in m_dados_boleto:
                m_pdf = m_dados_boleto['pdf']
                if m_pdf:
                    self.url_pdf = m_pdf['charge']
            if 'link' in m_dados_boleto:
                self.url_html = m_dados_boleto['link']
    
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        ret = {
            "url_boleto_pdf": self.url_pdf,
            "url_boleto_html": self.url_html,
            }
        return ret

    def __str__(self):
        return self.url_pdf

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
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
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