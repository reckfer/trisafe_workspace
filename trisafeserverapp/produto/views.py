from django.shortcuts import render
from django.forms.models import model_to_dict
from rest_framework import routers, serializers, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import mixins
from produto.models import Produto
from cliente.models import Cliente
from gerenciadorlog.views import GerenciadorLogViewSet
from rest_framework.renderers import JSONRenderer
from comum.retorno import Retorno
import json
import traceback
import sys

class ProdutoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Produto
        fields = ('codigo', 'nome')

# ViewSets define the view behavior.
class ProdutoViewSet(viewsets.ModelViewSet, permissions.BasePermission):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    
    @action(detail=False, methods=['post'])
    def listar(self, request):
        try:
            v_gerenciador_log = GerenciadorLogViewSet()
            v_gerenciador_log.registrar_do_cliente(request)
            
            m_produto = Produto()
            
            retorno_produtos = m_produto.listar()
            return Response(retorno_produtos.json())
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '')
            return Response(retorno.json())
    
    @classmethod
    def apropriar_dados_http_chave(cls, request):
        m_produto = Produto()
        m_produto.cpf = request.data['codigo']

        return m_produto

    @classmethod
    def apropriar_dados_http(cls, request):
        m_produto = ProdutoViewSet.apropriar_dados_http_chave(request)
        
        m_produto.nome = request.data['nome']
        m_produto.tipo = request.data['tipo']
        m_produto.valor = request.data['valor']

        m_cliente = Cliente()
        m_cliente.cpf = request.data['cpf']
        m_produto.cliente = m_cliente
                
        return m_produto