import json
import sys
import traceback
import os
import logging
from trisafeserverapp.settings import BASE_DIR
from comum.contexto import Contexto
from comum.retorno import Retorno

# Get an instance of a logger
logger_cliente_app_fluxo = logging.getLogger('cliente.app.fluxo')
logger_servidor_app_fluxo = logging.getLogger('servidor.app.fluxo')

class GerenciadorLog (Contexto):
    
    def registrar_do_cliente(self, d_registros_log):
        try:
            if not d_registros_log or len(d_registros_log) <= 0:
                return Retorno(False, self, 'Nenhum registro de log recebido.')
            
            if(len(d_registros_log) > 0):
                
                logger_cliente_app_fluxo.info('+++ REGISTROS DO CLIENTE - INICIO +++ %s' % (self.get_dados_dispositivo_str()))
                
                for d_registro_log in d_registros_log:
                    # Add the line
                    logger_cliente_app_fluxo.info("[%s] %s" % (d_registro_log['data_hora'], d_registro_log['mensagem_log']))
                
                logger_cliente_app_fluxo.info('--- REGISTROS DO CLIENTE - FIM --- %s' % (self.get_dados_dispositivo_str()))
                logger_cliente_app_fluxo.info('')
                
            return Retorno(True, self)
        except Exception as e:
                    
            retorno = Retorno(False, self, 'O registro de log do cliente falhou.', None, None, e)
            return retorno

    def registrar_info(self, mensagem):
        logger_servidor_app_fluxo.info('%s %s  >  %s' % (self.get_dados_dispositivo_str(), self.get_url_requisicao_str(), mensagem))

    def registrar_erro(self, mensagem):
        logger_servidor_app_fluxo.error('%s %s  >  %s' % (self.get_dados_dispositivo_str(), self.get_url_requisicao_str(), mensagem))
    
    def registrar_excecao(self, mensagem, exc):
        logger_servidor_app_fluxo.exception('%s %s  >  %s %s' % (self.get_dados_dispositivo_str(), self.get_url_requisicao_str(), mensagem, traceback.format_exception(None, exc, exc.__traceback__)))
    
    def registrar_retorno_ao_cliente(self, oRetorno):
        self.registrar_retorno(oRetorno, 'Respondendo requisicao HTTP ao cliente.')
    
    def registrar_retorno(self, oRetorno, titulo = ''):
        
        if not oRetorno.estado.ok:
            if(oRetorno.estado.excecao):
                self.registrar_excecao('%s %s %s' % (titulo, oRetorno.estado.mensagemServidor, oRetorno.estado.json()), oRetorno.estado.excecao)
            else:
                self.registrar_erro('%s %s %s' % (titulo, oRetorno.estado.mensagemServidor, oRetorno.estado.json()))
        else:
            if logger_servidor_app_fluxo.isEnabledFor(logging.DEBUG):
                self.registrar_info('%s %s | Resposta (dados): %s' % (titulo, oRetorno.estado.mensagemServidor, oRetorno.json()))
            else:
                self.registrar_info('%s %s %s' % (titulo, oRetorno.estado.mensagemServidor, oRetorno.estado.json()))