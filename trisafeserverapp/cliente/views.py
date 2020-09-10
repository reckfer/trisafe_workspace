from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from cliente.models import Cliente
from gerenciadorlog.views import GerenciadorLogViewSet
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
from comum.credencial import Credencial
from autenticacaotrisafe.views import AutenticacaoTriSafeViewSet
import json
import traceback
import sys

class ClienteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Cliente
        fields = ('cpf', 'email', 'nome', 'endereco')

# ViewSets define the view behavior.
class ClienteViewSet(AutenticacaoTriSafeViewSet, viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

    # def initialize_request(self, request, *args, **kwargs):
        
    #     r = super().initialize_request(request, *args, **kwargs)
    #     return r
    
    @action(detail=False, methods=['post'])
    def obter(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_cliente = ClienteViewSet.apropriar_dados_http_chave(request)
            m_cliente.credencial = ClienteViewSet.apropriar_credenciais_iter_http(request)

            retorno_cliente = m_cliente.obter()
            return Response(retorno_cliente.json())
            
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())
    
    @action(detail=False, methods=['post'])
    def obter_ultimo(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_cliente = ClienteViewSet.apropriar_dados_http(request)
            m_cliente.credencial = ClienteViewSet.apropriar_credenciais_iter_http(request)

            retorno_cliente = m_cliente.obter_ultimo()
            
            return Response(retorno_cliente.json())
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @action(detail=False, methods=['post'])
    def incluir(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)
            
            m_cliente = ClienteViewSet.apropriar_dados_http(request)
            m_cliente.credencial = ClienteViewSet.apropriar_credenciais_iter_http(request)
            
            retorno = m_cliente.incluir()

            return Response(retorno.json())

        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @action(detail=False, methods=['post'])
    def alterar(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)
            
            m_cliente = ClienteViewSet.apropriar_dados_http(request)
            m_cliente.credencial = ClienteViewSet.apropriar_credenciais_iter_http(request)
            
            retorno = m_cliente.alterar()

            return Response(retorno.json())

        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @action(detail=False, methods=['post'])
    def salvar_foto_cnh(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)

            m_cliente = ClienteViewSet.apropriar_dados_http_chave(request)
            foto_cnh_base64 = ClienteViewSet.apropriar_dados_http_foto_cnh(request)

            retorno_cliente = m_cliente.salvar_foto_cnh(foto_cnh_base64)
            
            return Response(retorno_cliente.json())
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return Response(retorno.json())

    @classmethod
    def apropriar_dados_http_chave(cls, request):
        m_cliente = Cliente()
        
        d_dados_app = request.data['dados_app']
        d_cliente = d_dados_app['cliente']
        m_cliente.cpf = d_cliente['cpf']
        m_cliente.email = d_cliente['email']
    
        return m_cliente

    @classmethod
    def apropriar_dados_http(cls, request):
        m_cliente = ClienteViewSet.apropriar_dados_http_chave(request)
        
        d_dados_app = request.data['dados_app']
        d_cliente = d_dados_app['cliente']
        m_cliente.nome = d_cliente['nome']
        m_cliente.nome_usuario = d_cliente['nome_usuario']
        m_cliente.rua = d_cliente['rua']
        m_cliente.telefone = d_cliente['telefone']
        m_cliente.numero = d_cliente['numero']
        m_cliente.bairro = d_cliente['bairro']
        m_cliente.cidade = d_cliente['cidade']
        m_cliente.complemento = d_cliente['complemento']
        m_cliente.cep = d_cliente['cep']
        m_cliente.uf = d_cliente['uf']
        return m_cliente
    
    @classmethod
    def apropriar_credenciais_iter_http(cls, request):
        chave_iter = ''
        token_iter = ''
        
        d_dados_app = request.data['dados_app']
        if 'chaves' in d_dados_app:
            d_chaves = d_dados_app['chaves']
            chave_iter = d_chaves['chave_iter']
            token_iter = d_chaves['token_iter']

        credencial = Credencial(chave_iter, '')
        credencial.token_iter = token_iter

        return credencial
    
    @classmethod
    def apropriar_dados_http_foto_cnh(cls, request):
        m_cliente = Cliente()
        
        d_dados_app = request.data['dados_app']
        d_fotos = d_dados_app['fotos']
        foto_cnh_base64 = d_fotos['foto_cnh_base64']
    
        return foto_cnh_base64