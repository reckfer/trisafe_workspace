import json
import sys
import traceback
import os
import logging
from trisafeserverapp.settings import BASE_DIR
from comum.retorno import Retorno

class GerenciadorLog:
    def __init__(self, id_cliente):
        nome_arquivo = 'Atividades_%s.log' % (id_cliente)
        caminho_arquivo = os.path.join(BASE_DIR, nome_arquivo)
        logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

    def registrar(self, d_registros_log):
        try:
            if not d_registros_log or len(d_registros_log) <= 0:
                return Retorno(False, 'Nenhum registro de log recebido.')
            
            for d_registro_log in d_registros_log:
                # Add the line
                logging.debug("[%s] %s" % (d_registro_log['data_hora'], d_registro_log['mensagem_log']))

            return Retorno(True)
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.')
            return retorno