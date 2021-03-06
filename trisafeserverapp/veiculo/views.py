from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from veiculo.models import Veiculo
from cliente.models import Cliente
from autenticacaotrisafe.views import AutenticacaoTriSafeViewSet
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
import json
import traceback
import sys

class VeiculoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Veiculo
        fields = ('placa', 'apelido')

# ViewSets define the view behavior.
class VeiculoViewSet(AutenticacaoTriSafeViewSet, viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Veiculo.objects.all()
    serializer_class = VeiculoSerializer
    
    def inicializar_contexto(self, request):
        super().inicializar_contexto(request)

        self.m_veiculo = Veiculo()
        self.m_cliente = Cliente()
        self.definir_contexto(self.m_veiculo)
        self.definir_contexto(self.m_cliente)

    @action(detail=False, methods=['post'])
    def incluir(self, request):
        try:
            self.apropriar_dados_http(request.data)
            
            retorno = self.m_veiculo.incluir()

            return retorno.gerar_resposta_http()

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão dos dados do veículo falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def alterar(self, request):
        try:
            self.apropriar_dados_http(request.data)
            
            retorno = self.m_veiculo.alterar()

            return retorno.gerar_resposta_http()

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A atualização dos dados do veículo falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def obter(self, request):
        try:
            self.apropriar_dados_http(request.data)
            
            retorno_veiculo = self.m_veiculo.obter()
            return retorno_veiculo.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta dos dados cadastrais do veículo falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def excluir(self, request):
        try:
            self.apropriar_dados_http(request.data)
            
            retorno_veiculo = self.m_veiculo.excluir()
            
            return retorno_veiculo.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta dos dados cadastrais do veículo falhou.', None, None, e)
            return retorno.gerar_resposta_http()

    @action(detail=False, methods=['post'])
    def listar_por_cliente(self, request):
        try:
            self.apropriar_dados_http(request.data)

            retorno = self.m_veiculo.listar_por_cliente()
            
            return retorno.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta a veículos cadastrados do Cliente falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    @action(detail=False, methods=['post'])
    def salvar_foto_doc(self, request):
        try:
            self.apropriar_dados_http(request.data)
            foto_doc_base64 = self.extrair_dados_http_foto_doc(request.data)
            
            retorno = self.m_veiculo.salvar_foto_doc(foto_doc_base64)
            
            return retorno.gerar_resposta_http()
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta a veículos cadastrados do Cliente falhou.', None, None, e)
            return retorno.gerar_resposta_http()
    
    def apropriar_dados_http(self, d_dados_requisicao):

        d_veiculo = d_dados_requisicao['veiculo']
        
        self.m_veiculo.placa = d_veiculo['placa']
        self.m_veiculo.modelo = d_veiculo['modelo']
        self.m_veiculo.marca = d_veiculo['marca']
        self.m_veiculo.ano = d_veiculo['ano']
        self.m_veiculo.apelido = d_veiculo['apelido']

        self.apropriar_cliente_dados_http(d_veiculo)
        
        self.m_veiculo.cliente = self.m_cliente
    
    def apropriar_cliente_dados_http(self, d_veiculo):
        d_cliente = d_veiculo['cliente']
        self.m_cliente.cpf = d_cliente['cpf']
    
    def extrair_dados_http_foto_doc(self, d_dados_requisicao):
        d_veiculo = d_dados_requisicao['veiculo']
        d_foto_doc = d_veiculo['foto_doc']
        
        return d_foto_doc['foto_base64']    