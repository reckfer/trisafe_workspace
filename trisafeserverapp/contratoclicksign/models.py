from decouple import config
from django.db import models
from comum.retorno import Retorno
from comum.credencial import Credencial
from datetime import date
import requests
import json
import logging

logger_servidor_app_fluxo = logging.getLogger('servidor.app.fluxo')

class ContratoClicksign(models.Model):
    
    def __init__(self, credencial_cliente):
        self.credencial = None
        self.headers_clicksign = None
        self.querystring_access_token = None
        self.retorno_autenticacao = None
        self.chave_template_contrato = None

        self.__autenticar_clicksign(credencial_cliente)

    def obter(self, chave_doc):

        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        url = ''

        if(chave_doc and len(chave_doc) > 0):
            url = "https://sandbox.clicksign.com/api/v1/documents/{0}{1}".format(chave_doc, self.querystring_access_token)

        r = requests.get(url, headers=self.headers_clicksign)

        # tenta obter por id_clicksign.
        retorno = self.__tratarRespostaHTTP(r)
        
        if not retorno.estado.ok:
            return retorno

        d_dados_doc = retorno.dados

        if 'document' in d_dados_doc:
            retorno.dados = d_dados_doc['document']
        else:
            retorno = Retorno(False, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno
    
    def obter_url_contrato_docx(self, chave_doc_clicksign):

        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        # url = ''

        # if(chave_doc_clicksign and len(chave_doc_clicksign) > 0):
        #     url = "https://sandbox.clicksign.com/api/v1/documents/{0}{1}".format(chave_doc_clicksign, self.querystring_access_token)

        # r = requests.get(url, headers=self.headers_clicksign)

        # # tenta obter por id_clicksign.
        # retorno = self.__tratarRespostaHTTP(r)
        
        retorno = self.obter(chave_doc_clicksign)
    
        if not retorno.estado.ok:
            return retorno

        d_dados_doc = retorno.dados
        tem_url = False
        
        if(d_dados_doc):
            if 'downloads' in d_dados_doc:
                d_downloads = d_dados_doc['downloads']
                if 'original_file_url' in d_downloads:
                    
                    url = d_downloads['original_file_url']

                    if(url and len(str(url).strip()) > 0):
                        tem_url = True

        if tem_url:
            retorno = Retorno(True)
            retorno.dados = url
        else:
            retorno = Retorno(False, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno

    def incluir(self, m_cliente):
        url = "https://sandbox.clicksign.com/api/v1/templates/%s/documents%s" % (self.chave_template_contrato, self.querystring_access_token)

        d_cliente_clicksign = self.__montar_dic_cliente(m_cliente)
        
        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        r = requests.post(url, headers=self.headers_clicksign, data=d_cliente_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        return retorno
    
    def fazer_download(self, d_documento):
        url = ''
        
        if(d_documento):
            if 'downloads' in d_documento:
                d_downloads = d_documento['downloads']
                if 'original_file_url' in d_downloads:
                    url = d_downloads['original_file_url']
        
        r = requests.get(url, allow_redirects=True)
        
        # retorno = self.__tratarRespostaHTTP(r)
        
        # if not retorno.estado.ok:
        #     return retorno
        
        # Salva o documento
        file = open('a.docx', 'wb')
        file.write(r.content)
        file.close()
    
    def alterar(self, m_cliente):
        url = "https://cnxs-api.clicksigntelemetria.com/v1/users/%s" % (m_cliente.id_cliente_clicksign)
        
        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        d_cliente_clicksign = self.__montar_dic_cliente(m_cliente)
        r = requests.put(url, headers=self.headers_clicksign, data=d_cliente_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)

        if retorno.estado.ok:
            usuario = retorno.dados['user']
            retorno.dados = usuario

        return retorno

    def __montar_dic_cliente(self, m_cliente):
        data_atual = date.today()
        path = "/Contrato_Rastreamento_%s.pdf" % m_cliente.cpf

        jsonCliente = json.dumps({
            "document": {
                "path": path,
                "template": {
                    "data": {
                        "Razão Social": m_cliente.nome,
                        "Cidade": m_cliente.cidade,
                        "Estado": m_cliente.uf,
                        "CNPJ": m_cliente.cpf,
                        "Nome": m_cliente.nome,
                        "Detalhes do Serviço": "serviços de rastreamento veicular",
                        "Remuneração $": "R$ 100,00",
                        "Remuneração extenso": "cem reais",
                        "Dia da Assinatura": data_atual.day,
                        "Mês da Assinatura": data_atual.month,
                        "Ano da Assinatura": data_atual.year
                    }
                }
            }
        })

        return jsonCliente
    
    def __tratarRespostaHTTP(self, respostaHTTP):
        
        json_dados = self.__obterJsonBodyHTTP(respostaHTTP.text)
        
        if respostaHTTP.status_code < 200 or respostaHTTP.status_code > 300:
            
            logger_servidor_app_fluxo.error('RespostaHTTP Clicksign Erro: %s' % respostaHTTP.text)

            mensagem_erro = json_dados['errors'][0]['message']

            retorno = Retorno(False, 'Erro de comunicação com a Clicksign. %s' % mensagem_erro, 'ErroComunicacaoClicksign', respostaHTTP.status_code)
        else:
            logger_servidor_app_fluxo.info('RespostaHTTP Clicksign Sucesso: %s' % respostaHTTP.text)

            retorno = Retorno(True)
            dadosRetorno = respostaHTTP.json()
            
            if dadosRetorno:                
                retorno.dados = dadosRetorno
            else:
                # nao localizado
                retorno = Retorno(False, respostaHTTP.text, '', 404)

        return retorno

    def __obterJsonBodyHTTP(self, texto):
        json_texto = texto

        if(texto and len(texto) > 0):
            try:
                json_texto = json.loads(texto)

            except Exception:
                pass

        return json_texto        

    def __autenticar_clicksign(self, credencial_cliente):
        self.headers_clicksign = None
        chave_clicksign_cliente = credencial_cliente.chave_clicksign_cli
        chave_clicksign_servidor = config('CHAVE_CLICKSIGN')
        token_clicksign = ''

        if(credencial_cliente):
            token_clicksign = credencial_cliente.token_clicksign
        
        # Cria uma credencial completa, com a chave parcial do servidor, 
        # pois o parametro "credencial_cliente" vem soh com a chave parcial do cliente.
        self.credencial = Credencial(chave_clicksign_cliente, chave_clicksign_servidor)
        self.credencial.token_clicksign = token_clicksign

        retorno = Retorno(True)
        
        if self.credencial.token_clicksign and len(self.credencial.token_clicksign) > 0:
            
            retorno.credencial = self.credencial
            
        else:
            # Le o token criptografado do arquivo e atribui para a credencial.
            arquivo_iter = open('.env_access_clicksign', 'rb')
            
            token_clicksign = arquivo_iter.read()

            if(token_clicksign):
                self.credencial.token_clicksign = token_clicksign

        

        retorno.credencial = self.credencial
        token = self.credencial.get_token_clicksign()
        
        self.headers_clicksign = {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json' }

        self.querystring_access_token = '?access_token=%s' % (token)

        self.chave_template_contrato = config('CHAVE_TEMPLATE_CONTRATO_CS')

        self.retorno_autenticacao = retorno

    # def json(self):
    #     return self.__criar_json()

    # def __criar_json(self):
    #     ret = {
    #         "token_clicksign": self.token_clicksign,
    #         "chave_clicksign": self.chave_ter
    #         }
    #     return ret

    # def __str__(self):
    #     return self.nome