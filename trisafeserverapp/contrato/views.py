import mimetypes
from django.shortcuts import render
from django.forms.models import model_to_dict
from django.http.response import HttpResponse
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from contrato.models import Contrato
from comum.credencial import Credencial
from produto.models import Produto
from cliente.models import Cliente
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
# from boleto.models import TransacaoGerenciaNet
from cliente.views import ClienteViewSet
from boletogerencianet.models import BoletoGerenciaNet
from boletogerencianet.views import GerenciadorLogViewSet
from autenticacaotrisafe.views import AutenticacaoTriSafeViewSet
import json
import traceback
import sys

class ContratoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Contrato
        fields = ()

# ViewSets define the view behavior.
class ContratoViewSet(AutenticacaoTriSafeViewSet, viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
    
    # @action(detail=False, methods=['post'])
    # def incluir(self, request):
    #     try:
    #         v_gerenciador_log = GerenciadorLogViewSet()
    #         v_gerenciador_log.registrar_do_cliente(request)

    #         m_contrato = ContratoViewSet.apropriar_dados_http(request)
    #         m_contrato.credencial = ContratoViewSet.apropriar_credenciais_clicksign_http(request)
            
    #         # retorno = m_contrato.obter_por_cliente()

    #         # if retorno.estado.codMensagem == 'NaoCadastrado':
    #         retorno = m_contrato.incluir()
    #         # elif retorno.estado.ok:
    #         #     m_contrato = retorno.dados
    #         #     retorno = m_contrato.alterar(lista_produtos)
    #         # else:    
    #         #     return retorno

    #         return retorno.gerar_resposta_http()
    #     except Exception as e:
                    
    #         retorno = Retorno(False, 'A inclusão do contrato falhou.', None, None, e)
    #         return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def incluir_com_signatario(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_contrato = ContratoViewSet.apropriar_dados_http(request)
            m_contrato.credencial = ContratoViewSet.apropriar_credenciais_clicksign_http(request)
            
            retorno_contrato = m_contrato.incluir_com_signatario()
            
            if not retorno_contrato:
                return retorno_contrato

            return retorno_contrato.gerar_resposta_http()
        except Exception as e:
                    
            retorno = Retorno(False, 'A inclusão do contrato falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    # @action(detail=False, methods=['post'])
    # def incluir_signatario(self, request):
    #     try:
    #         v_gerenciador_log = GerenciadorLogViewSet()
    #         v_gerenciador_log.registrar_do_cliente(request)

    #         m_contrato = ContratoViewSet.apropriar_dados_http(request)
    #         m_contrato.credencial = ContratoViewSet.apropriar_credenciais_clicksign_http(request)
            
    #         retorno = m_contrato.incluir_signatario(m_contrato.cliente)
            
    #         return retorno.gerar_resposta_http()
    #     except Exception as e:
                    
    #         retorno = Retorno(False, 'A inclusão do contrato falhou.', None, None, e)
    #         return retorno.gerar_resposta_http()
    
    # @action(detail=False, methods=['post'])
    # def incluir_signatario_contrato(self, request):
    #     try:
    #         v_gerenciador_log = GerenciadorLogViewSet()
    #         v_gerenciador_log.registrar_do_cliente(request)

    #         m_contrato = ContratoViewSet.apropriar_dados_http(request)
            
    #         retorno = m_contrato.obter_por_cliente()

    #         if not retorno.estado.ok:
    #             return retorno.gerar_resposta_http()
            
    #         m_contrato = retorno.dados
    #         m_contrato.credencial = ContratoViewSet.apropriar_credenciais_clicksign_http(request)
            
    #         retorno = m_contrato.incluir_signatario_contrato(m_contrato)
            
    #         return retorno.gerar_resposta_http()
    #     except Exception as e:
                    
    #         retorno = Retorno(False, 'A inclusão do contrato falhou.', None, None, e)
    #         return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def aceitar(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_contrato = ContratoViewSet.apropriar_dados_http(request)
            
            retorno_contrato = m_contrato.obter()

            if not retorno_contrato.estado.ok:
                return retorno_contrato.gerar_resposta_http()
            
            m_boleto = BoletoGerenciaNet()
            m_contrato = retorno_contrato.dados
            m_contrato.credencial = ContratoViewSet.apropriar_credenciais_clicksign_http(request)

            if not m_contrato.aceito:
                retorno = m_contrato.aceitar()

                if not retorno.estado.ok:
                    return retorno.gerar_resposta_http()

                m_contrato = retorno.dados
                
                retorno = m_boleto.gerar(m_contrato)
            else:
                retorno = m_boleto.obter(m_contrato)

            return retorno.gerar_resposta_http()

        except Exception as e:
                    
            retorno = Retorno(False, 'A aceitação do contrato falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def obter(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_contrato = ContratoViewSet.apropriar_dados_http(request)
            
            retorno = m_contrato.obter()
            
            return retorno.gerar_resposta_http()
        except Exception as e:
                    
            retorno = Retorno(False, 'A consulta do contrato falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def obter_por_cliente(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)
            
            m_contrato = ContratoViewSet.apropriar_dados_http(request)
            
            retorno = m_contrato.obter_por_cliente()
            
            return retorno.gerar_resposta_http()
        except Exception as e:
                    
            retorno = Retorno(False, 'A consulta do contrato falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    # @action(detail=False, methods=['post'])
    # def obter_url_contrato_docx(self, request):
    #     try:
    #         v_gerenciador_log = GerenciadorLogViewSet()
    #         v_gerenciador_log.registrar_do_cliente(request)
            
    #         m_contrato = ContratoViewSet.apropriar_dados_http(request)
    #         m_contrato.credencial = ContratoViewSet.apropriar_credenciais_clicksign_http(request)
            
    #         retorno = m_contrato.obter_url_contrato_docx()
            
    #         return retorno.gerar_resposta_http()
    #     except Exception as e:
                    
    #         retorno = Retorno(False, 'A consulta do contrato falhou.', None, None, e)
    #         return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def obter_arquivo_contrato(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_contrato = ContratoViewSet.apropriar_dados_http(request)
            
            retorno_contrato = m_contrato.gerar_contrato_pdf()
            
            if not retorno_contrato.estado.ok:
                return retorno_contrato.gerar_resposta_http()
        
            dados_arquivo = retorno_contrato.dados

            arquivo = open(dados_arquivo['caminho_arquivo'], 'rb')
            mime_type, _ = mimetypes.guess_type(dados_arquivo['caminho_arquivo'])
            http_response = HttpResponse(arquivo, content_type=mime_type)
            http_response['Content-Disposition'] = "attachment; filename=%s" % dados_arquivo['nome_arquivo']

            return http_response
        except Exception as e:
                    
            retorno = Retorno(False, 'A consulta do arquivo pdf do contrato falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def excluir_arquivo_contrato(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_contrato = ContratoViewSet.apropriar_dados_http(request)
            
            retorno = m_contrato.excluir_contrato()
            
            return retorno.gerar_resposta_http()
        except Exception as e:
                    
            retorno = Retorno(False, 'A exclusão do arquivo pdf do contrato falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @classmethod
    def apropriar_dados_http(cls, request):
        m_contrato = Contrato()
        m_contrato.cliente = ContratoViewSet.extrair_cliente_dados_http(request)
        
        d_dados_app = request.data['dados_app']
        d_contrato = d_dados_app['contrato']
        m_contrato.id_contrato = d_contrato['id_contrato']

        return m_contrato
    
    @classmethod
    def apropriar_credenciais_clicksign_http(cls, request):
        chave_clicksign = ''
        token_clicksign = ''
        
        d_dados_app = request.data['dados_app']
        if 'chaves' in d_dados_app:
            d_chaves = d_dados_app['chaves']
            chave_clicksign = d_chaves['chave_clicksign']
            token_clicksign = d_chaves['token_clicksign']

        credencial = Credencial(chave_clicksign, '')
        credencial.token_clicksign = token_clicksign

        return credencial

    @classmethod
    def extrair_cliente_dados_http(cls, request):
        m_cliente = Cliente()

        d_dados_app = request.data['dados_app']

        d_cliente = d_dados_app['cliente']        
        m_cliente.nome = d_cliente['nome']
        m_cliente.cpf = d_cliente['cpf']
        m_cliente.email = d_cliente['email']
        m_cliente.telefone = d_cliente['telefone']

        m_cliente.credencial = ClienteViewSet.apropriar_credenciais_iter_http(request)
        
        return m_cliente

    @classmethod
    def extrair_produtos_dados_http(cls, request):
   
        d_dados_app = request.data['dados_app']
        d_contrato = d_dados_app['contrato']
        d_produtos_contratados = d_contrato['produtos_contratados']
        
        return d_produtos_contratados