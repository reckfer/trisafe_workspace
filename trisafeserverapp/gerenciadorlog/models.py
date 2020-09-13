import json
import sys
import traceback
import os
import logging
from trisafeserverapp.settings import BASE_DIR
from comum.retorno import Retorno

# Get an instance of a logger
logger_cliente_app_fluxo = logging.getLogger('cliente.app.fluxo')

class GerenciadorLog:

    def registrar(self, d_registros_log):
        try:
            if not d_registros_log or len(d_registros_log) <= 0:
                return Retorno(False, 'Nenhum registro de log recebido.')
            
            for d_registro_log in d_registros_log:
                # Add the line
                logger_cliente_app_fluxo.info("[%s] %s" % (d_registro_log['data_hora'], d_registro_log['mensagem_log']))

            return Retorno(True)
        except Exception as e:
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno