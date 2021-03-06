from decouple import config
from django.db import models

from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno
from comum.credencial import Credencial
from datetime import date
import requests
import json
import logging

logger_servidor_app_fluxo = logging.getLogger('servidor.app.fluxo')

class ContratoClicksign(models.Model, GerenciadorLog):
    
    def __init__(self, objeto_contexto):
        self.headers_clicksign = None
        self.querystring_access_token = None
        self.retorno_autenticacao = None
        self.chave_template_contrato = None

        objeto_contexto.definir_contexto(self)
        self.__autenticar_clicksign()

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
            retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno
    
    def obter_url_contrato_pdf(self, chave_doc_clicksign):

        if(not self.headers_clicksign):
            return self.retorno_autenticacao
        
        retorno = self.obter(chave_doc_clicksign)
    
        if not retorno.estado.ok:
            return retorno

        d_dados_doc = retorno.dados
        tem_url = False
        
        if(d_dados_doc):
            if 'downloads' in d_dados_doc:
                d_downloads = d_dados_doc['downloads']
                if 'signed_file_url' in d_downloads:
                    
                    url = d_downloads['signed_file_url']

                    if(url and len(str(url).strip()) > 0):
                        tem_url = True

        if tem_url:
            retorno = Retorno(True, self)
            retorno.dados = url
        else:
            retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno

    # def obter_url_contrato_docx(self, chave_doc_clicksign):

    #     if(not self.headers_clicksign):
    #         return self.retorno_autenticacao
        
    #     retorno = self.obter(chave_doc_clicksign)
    
    #     if not retorno.estado.ok:
    #         return retorno

    #     d_dados_doc = retorno.dados
    #     tem_url = False
        
    #     if(d_dados_doc):
    #         if 'downloads' in d_dados_doc:
    #             d_downloads = d_dados_doc['downloads']
    #             if 'original_file_url' in d_downloads:
                    
    #                 url = d_downloads['original_file_url']

    #                 if(url and len(str(url).strip()) > 0):
    #                     tem_url = True

    #     if tem_url:
    #         retorno = Retorno(True, self)
    #         retorno.dados = url
    #     else:
    #         retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

    #     return retorno

    def incluir(self, m_cliente):
        url = "https://sandbox.clicksign.com/api/v1/templates/%s/documents%s" % (self.chave_template_contrato, self.querystring_access_token)

        d_cliente_clicksign = self.__montar_dic_cliente(m_cliente)
        
        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        r = requests.post(url, headers=self.headers_clicksign, data=d_cliente_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        return retorno

    def incluir_signatario(self, m_cliente):
        url = "https://sandbox.clicksign.com/api/v1/signers%s" % (self.querystring_access_token)

        d_signatario_clicksign = self.__montar_dic_signatario(m_cliente)
        
        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        r = requests.post(url, headers=self.headers_clicksign, data=d_signatario_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        if not retorno.estado.ok:
            return retorno

        d_dados_signatario = retorno.dados
        tem_chave = False
        chave_signatario = ''

        if(d_dados_signatario):
            if 'signer' in d_dados_signatario:
                d_signatario = d_dados_signatario['signer']
                if 'key' in d_signatario:
                    
                    chave_signatario = d_signatario['key']

                    if(chave_signatario and len(str(chave_signatario).strip()) > 0):
                        tem_chave = True

        if tem_chave:
            retorno = Retorno(True, self)
            retorno.dados = chave_signatario
        else:
            retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno
    
    def incluir_signatario_contrato(self, m_contrato):
        url = "https://sandbox.clicksign.com/api/v1/lists%s" % (self.querystring_access_token)

        d_signatario_clicksign = self.__montar_dic_signatario_contrato(m_contrato)
        
        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        r = requests.post(url, headers=self.headers_clicksign, data=d_signatario_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        if not retorno.estado.ok:
            return retorno

        d_dados_signatario = retorno.dados
        tem_chave = False
        chave_signatario = ''

        if(d_dados_signatario):
            if 'list' in d_dados_signatario:
                d_signatario = d_dados_signatario['list']
                if 'request_signature_key' in d_signatario:
                    
                    chave_requisicao_assinatura = d_signatario['request_signature_key']

                    if(chave_requisicao_assinatura and len(str(chave_requisicao_assinatura).strip()) > 0):
                        tem_chave = True

        if tem_chave:
            retorno = Retorno(True, self, '', 'SignatarioCadastrado')
            retorno.dados = chave_requisicao_assinatura
        else:
            retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno
    
    def solicitar_assinatura(self, m_contrato):
        url = "https://sandbox.clicksign.com/api/v1/notifications%s" % (self.querystring_access_token)

        d_signatario_clicksign = self.__montar_dic_solicitacao_assinatura(m_contrato)
        
        if(not self.headers_clicksign):
            return self.retorno_autenticacao

        r = requests.post(url, headers=self.headers_clicksign, data=d_signatario_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        # if not retorno.estado.ok:
        #     return retorno

        # d_dados_signatario = retorno.dados
        # tem_chave = False
        # chave_signatario = ''

        # if(d_dados_signatario):
        #     if 'list' in d_dados_signatario:
        #         d_signatario = d_dados_signatario['list']
        #         if 'request_signature_key' in d_signatario:
                    
        #             chave_requisicao_assinatura = d_signatario['request_signature_key']

        #             if(chave_requisicao_assinatura and len(str(chave_requisicao_assinatura).strip()) > 0):
        #                 tem_chave = True

        # if tem_chave:
        #     retorno = Retorno(True, self)
        #     retorno.dados = chave_requisicao_assinatura
        # else:
        #     retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno
    
    def obter_signatario(self, m_cliente):
        url = "https://sandbox.clicksign.com/api/v1/signers/%s%s" % (m_cliente.id_signatario_contrato, self.querystring_access_token)

        r = requests.get(url, headers=self.headers_clicksign)
        
        retorno = self.__tratarRespostaHTTP(r)
        
        if not retorno.estado.ok:
            return retorno

        d_dados_signatario = retorno.dados
        tem_chave = False
        chave_signatario = ''

        if(d_dados_signatario):
            if 'signer' in d_dados_signatario:
                d_signatario = d_dados_signatario['signer']
                if 'key' in d_signatario:
                    
                    chave_signatario = d_signatario['key']

                    if(chave_signatario and len(str(chave_signatario).strip()) > 0):
                        tem_chave = True

        if tem_chave:
            retorno = Retorno(True, self)
            retorno.dados = chave_signatario
        else:
            retorno = Retorno(False, self, 'Não foi possível obter o documento do contrato. Os dados retornaram vazios', '', 404)

        return retorno
    
    def fazer_download(self, url):
        # url = ''
        
        # if(d_documento):
        #     if 'downloads' in d_documento:
        #         d_downloads = d_documento['downloads']
        #         if 'original_file_url' in d_downloads:
        #             url = d_downloads['original_file_url']
        
        r = requests.get(url, allow_redirects=True)
        
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
        path = "/Contrato_Rastreamento_%s.docx" % m_cliente.cpf

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
    
    def __montar_dic_signatario(self, m_cliente):
        
        jsonCliente = json.dumps({
            "signer": {
                "name": "Fernando Reckziegel", #m_cliente.nome,
                "email": 'nandorex@gmail.com',
                "phone_number": m_cliente.telefone,
                "auths": ["email"],
                "documentation": m_cliente.cpf,
                "delivery": ["email"]
            }
        })

        return jsonCliente
    
    def __montar_dic_signatario_contrato(self, m_contrato):
        m_cliente = m_contrato.cliente

        jsonCliente = json.dumps({
            "list": {
                "document_key": m_contrato.chave_contrato_ext,
                "signer_key": m_cliente.id_signatario_contrato,
                "sign_as": 'sign',
                "message": 'Por gentileza, assine o contrato identificado pelo link neste e-mail.',
            }
        })

        return jsonCliente
    
    def __montar_dic_solicitacao_assinatura(self, m_contrato):
        jsonCliente = ''
        m_cliente = m_contrato.cliente

        ids_assinaturas_clicksign = m_cliente.id_signatario_contrato.split(sep="|-|")

        if isinstance(ids_assinaturas_clicksign, list) and len(ids_assinaturas_clicksign) > 1:
            
            id_requisicao_assinatura = ids_assinaturas_clicksign[1]
            
            jsonCliente = json.dumps({
                    "request_signature_key": id_requisicao_assinatura,
                    "message": 'Por gentileza, assine o contrato identificado pelo link neste e-mail.'
            })

        return jsonCliente
    
    def __tratarRespostaHTTP(self, respostaHTTP):
        
        if respostaHTTP.status_code < 200 or respostaHTTP.status_code > 300:
            
            mensagem_erro = self.__extrairMensagemErro(respostaHTTP.text)

            retorno = Retorno(False, self, 'Erro de comunicacao com a Clicksign. %s' % mensagem_erro, 'ErroComunicacaoClicksign', respostaHTTP.status_code)
        else:
            dadosRetorno = respostaHTTP.text
            
            retorno = Retorno(True, self)
            
            if(dadosRetorno):
                dadosRetorno = respostaHTTP.json()
            
            if dadosRetorno:                
                retorno.dados = dadosRetorno
            else:
                # nao localizado
                retorno = Retorno(False, respostaHTTP.text, '', 404)

        self.registrar_retorno(retorno, 'Retorno da Clicksign.')
        return retorno

    def __extrairMensagemErro(self, dados_retorno_http):
        texto_erro = ''
        json_dados = self.__obterJsonBodyHTTP(dados_retorno_http)
        
        if('errors' in json_dados):            
            d_erros = json_dados['errors']
            
            if isinstance(d_erros, list):
                if len(d_erros) > 0:
                    
                    d_mensagem = d_erros[0]

                    if('message' in d_mensagem):
                        texto_erro = d_mensagem['message']
                    else:
                        texto_erro = d_mensagem
            else:
                texto_erro = json.dumps(json_dados)

        return texto_erro

    def __obterJsonBodyHTTP(self, texto):
        json_dados = texto

        if(texto and isinstance(texto, str) and len(texto) > 0):
            try:
                json_dados = json.loads(texto)

            except Exception:
                json_dados = {}
                pass

        return json_dados

    def __autenticar_clicksign(self):
        self.headers_clicksign = None
        chave_clicksign_cliente = ''
        chave_clicksign_servidor = config('CHAVE_CLICKSIGN')
        token_clicksign = ''

        if(self.credencial_clicksign):
            chave_clicksign_cliente = self.credencial_clicksign.chave_clicksign_cli
            token_clicksign = self.credencial_clicksign.token_clicksign
        
        # Cria uma credencial completa, com a chave parcial do servidor, 
        # pois o atributo "self.credencial_clicksign" vem soh com a chave parcial do cliente.
        self.credencial_clicksign = Credencial(chave_clicksign_cliente, chave_clicksign_servidor)
        self.credencial_clicksign.token_clicksign = token_clicksign

        retorno = Retorno(True, self)
        
        if not self.credencial_clicksign.token_clicksign or len(self.credencial_clicksign.token_clicksign) <= 0:
            # Le o token criptografado do arquivo e atribui para a credencial.
            arquivo_iter = open('.env_access_clicksign', 'rb')
            
            token_clicksign = arquivo_iter.read()

            if(token_clicksign):
                self.credencial_clicksign.token_clicksign = token_clicksign

        retorno.dados = self.credencial_clicksign
        token = self.credencial_clicksign.get_token_clicksign()
        
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