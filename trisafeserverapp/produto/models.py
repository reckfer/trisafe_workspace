import json
import sys
import traceback
from django.db import models
from rest_framework import status

from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno

class Produto(models.Model, GerenciadorLog):
    # Tipos de produtos
    FISICO = 'F'
    SERVICO = 'S'
    TIPOS_PRODUTO = [
        (FISICO, 'Produto Físico'),
        (SERVICO, 'Serviço'),
    ]

    codigo = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=70, null=False, unique=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=1, null=False, choices=TIPOS_PRODUTO, default=FISICO)
    dt_hr_inclusao = models.DateTimeField(blank=False, null=False, auto_now_add=True)
    ult_atualizacao = models.DateTimeField(blank=False, null=False, auto_now=True)
    
    def obter(self):
        try:
            retorno = Produto.validar_dados_obrigatorios_chaves(self)
                
            if not retorno.estado.ok:
                return retorno

            retorno = Retorno(False, self, 'Produto não cadastrado', 'NaoCadastrado', 406)
            
            lista_produtos = Produto.objects.filter(nome=self.nome)
            if lista_produtos:
                m_produto = lista_produtos[0]
                if m_produto:
                    retorno = Retorno(True, self)
                    retorno.dados = m_produto
            
            return retorno

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta a produtos Trisafe falhou.', None, None, e)
            return retorno
    
    def listar(self):
        try:
            retorno = Retorno(False, self, 'Nenhum Produto TriSafe está cadastrado.', 'NaoCadastrado', 406)

            # Lista os produtos cadastrados.
            lista_produtos = Produto.objects.all()
            if lista_produtos:
                lista_produtos_json = []
                for m_produto in lista_produtos:
                    lista_produtos_json.append(m_produto)

                retorno = Retorno(True, self)
                retorno.dados = lista_produtos
                
            return retorno
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta a produtos Trisafe falhou.', None, None, e)
            return retorno

    def listar_especificos(self, chaves_produtos):
        try:
            msgNaoEncontrado = 'Cadastro do produto {0} ({1})) não encontrado.'
            
            produtos = list()

            retorno = Retorno(True, self)
            retorno.dados = produtos

            for chave_produto in chaves_produtos:
                
                lista_produtos = Produto.objects.filter(codigo = chave_produto['codigo'])
                if lista_produtos:
                    m_produto = lista_produtos[0]
                    if m_produto:
                        produtos.append(m_produto)
                    else:
                        retorno = Retorno(False, self, msgNaoEncontrado.format(chave_produto['nome'], chave_produto['codigo']), 'NaoCadastrado', 406)
                        break
            
            return retorno
            
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta a produtos Trisafe falhou.', None, None, e)
            return retorno

    def incluir(self):
        try:
            retorno = Produto.validar_dados_obrigatorios(self)
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o produto já está cadastrado.
            retorno = Produto.obter(self)

            if retorno.estado.codMensagem != 'NaoCadastrado':
                return retorno

            self.save()
            
            retorno = Retorno(True, self, 'Cadastro realizado com sucesso.', 200)
            retorno.dados = self

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão de produto Trisafe falhou.', None, None, e)
            return retorno
    
    def validar_dados_obrigatorios_chaves(self):
        if self.codigo <= 0 or len(str(self.nome).strip()) <= 0 :
            return Retorno(False, self, "Informe o código ou o nome completo do produto.", 406)

        return Retorno(True, self)
    
    def validar_dados_obrigatorios(self):
        
        retorno = Produto.validar_dados_obrigatorios_chaves(self)
        
        if not retorno.estado.ok:
            return retorno

        if self.valor <= 0:
            return Retorno(False, self, "Informe o valor do produto.", 406)

        return Retorno(True, self)
    
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        ret = {
                "codigo": self.codigo,
                "nome": self.nome,
                "valor": self.valor,
                "tipo": self.tipo,
                "dt_hr_inclusao": self.dt_hr_inclusao,
            }
        return ret

    def __str__(self):
        return self.nome