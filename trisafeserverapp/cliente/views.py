from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from cliente.models import Cliente
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
from comum.credencial import Credencial
from clienteiter.models import ClienteIter
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
    
    def inicializar_contexto(self, request):
        super().inicializar_contexto(request)
        
        self.m_cliente = Cliente()
        self.definir_contexto(self.m_cliente)
        self.m_cliente.o_cliente_iter = ClienteIter(self.m_cliente)

    @action(detail=False, methods=['post'])
    def obter(self, request):
        try:
            self.apropriar_dados_http_chave(request.data)
            
            retorno_cliente = self.m_cliente.obter()
            return retorno_cliente.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta dos dados cadastrais falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def obter_ultimo(self, request):
        try:
            self.apropriar_dados_http(request.data)

            retorno_cliente = self.m_cliente.obter_ultimo()
            
            return retorno_cliente.gerar_resposta_http()

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta dos dados cadastrais falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def incluir(self, request):
        try:
            self.apropriar_dados_http(request.data)
            
            retorno = self.m_cliente.incluir()

            return retorno.gerar_resposta_http()

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão dos dados cadastrais falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def alterar(self, request):
        try:
            self.apropriar_dados_http(request.data)
            
            retorno = self.m_cliente.alterar()

            return retorno.gerar_resposta_http()

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A atualização dos dados cadastrais falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def salvar_foto_cnh(self, request):
        try:
            self.apropriar_dados_http_chave(request.data)

            foto_cnh_base64 = self.apropriar_dados_http_foto_cnh(request.data)
            retorno_cliente = self.m_cliente.salvar_foto_cnh(foto_cnh_base64)
            
            return retorno_cliente.gerar_resposta_http()
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão da foto CNH falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    def apropriar_dados_http_chave(self, d_dados_requisicao):
        
        d_cliente = d_dados_requisicao['cliente']

        self.m_cliente.cpf = d_cliente['cpf']
        self.m_cliente.email = d_cliente['email']
    
    def apropriar_dados_http(self, d_dados_requisicao):
        
        self.apropriar_dados_http_chave(d_dados_requisicao)
        
        d_cliente = d_dados_requisicao['cliente']
        self.m_cliente.nome = d_cliente['nome']
        self.m_cliente.nome_usuario = d_cliente['nome_usuario']
        self.m_cliente.rua = d_cliente['rua']
        self.m_cliente.telefone = d_cliente['telefone']
        self.m_cliente.numero = d_cliente['numero']
        self.m_cliente.bairro = d_cliente['bairro']
        self.m_cliente.cidade = d_cliente['cidade']
        self.m_cliente.complemento = d_cliente['complemento']
        self.m_cliente.cep = d_cliente['cep']
        self.m_cliente.uf = d_cliente['uf']
        
    def apropriar_dados_http_foto_cnh(self, d_dados_requisicao):
        
        d_fotos = d_dados_requisicao['fotos']
        foto_cnh_base64 = d_fotos['foto_cnh_base64']
    
        return foto_cnh_base64