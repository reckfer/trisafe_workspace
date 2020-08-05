import json
import sys
import traceback
from django.db import models
from rest_framework import status
from clienteiter.models import ClienteIter
from comum.retorno import Retorno

class Cliente(models.Model):
    id_cliente_iter = models.IntegerField(primary_key=True)
    nome = models.CharField(max_length=70, null=False)
    nome_usuario = models.CharField(max_length=20, blank=False, null=True)
    cpf = models.CharField(max_length=11, blank=False, null=True)
    rg = models.CharField(max_length=10, blank=False, null=True)
    rua = models.CharField(max_length=200, blank=False, null=True)
    numero = models.IntegerField()
    complemento = models.CharField(max_length=30, blank=False, null=True)
    cep = models.CharField(max_length=11, blank=False, null=True)
    bairro = models.CharField(max_length=200, blank=False, null=True) 
    cidade = models.CharField(max_length=200, blank=False, null=True) 
    uf = models.CharField(max_length=11, blank=False, null=True)
    telefone = models.CharField(max_length=11, blank=False, null=True)
    email = models.EmailField()
    senha = models.CharField(max_length=20, blank=False, null=True)
    dt_hr_inclusao = models.DateTimeField(blank=False, null=False, auto_now_add=True)
    ult_atualizacao = models.DateTimeField(blank=False, null=False, auto_now=True)
    chave_iter = None
    
    def obter(self):
        try:
            retorno = Cliente.validar_dados_obrigatorios_chaves(self)
                
            if not retorno.estado.ok:
                return retorno

            retorno = Retorno(False, 'Cliente não cadastrado', 'NaoCadastrado', 406)
            
            # Valida se o cliente já está cadastrado.
            lista_clientes = Cliente.objects.filter(cpf=self.cpf)
            if lista_clientes:
                m_cliente = lista_clientes[0]
                if m_cliente:
                    m_cliente.chave_iter = self.chave_iter
                    m_cliente_iter = ClienteIter()
                    # Obtem o cadastro na Iter.
                    retorno_cliente_iter = m_cliente_iter.obter(m_cliente)
                    
                    if not retorno_cliente_iter.estado.ok:
                        return retorno_cliente_iter
                    
                    m_cliente.converter_de_cliente_iter(retorno_cliente_iter.json())
                    m_cliente.nome_usuario = m_cliente.nome_usuario
                    
                    retorno = Retorno(True)
                    retorno.dados = m_cliente
            
            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno

    def obter_ultimo(self):
        try:
            retorno = Retorno(False)
            # Valida se o cliente já está cadastrado.
            lista_clientes = Cliente.objects.filter()
            if lista_clientes:
                m_cliente = lista_clientes[lista_clientes.count()-1]
                if m_cliente:
                    m_cliente.chave_iter = self.chave_iter
                    # Obtem o cadastro na Iter.
                    retorno_cliente_iter = ClienteIter.obter(self, m_cliente)
                    
                    if not retorno_cliente_iter.estado.ok:
                        return retorno_cliente_iter
                    
                    m_cliente.converter_de_cliente_iter(retorno_cliente_iter.json())
                    m_cliente.nome_usuario = m_cliente.nome_usuario
                    
                    retorno = Retorno(True)
                    retorno.dados = m_cliente
            
            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno
                
    def incluir(self):
        try:
            retorno = Cliente.validar_dados_obrigatorios(self)
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o cliente já está cadastrado.
            retorno = Cliente.obter(self)
    
            if retorno.estado.excecao or retorno.estado.codMensagem != 'NaoCadastrado':
                return Retorno(False, 
                                'Erro ao validar cadastro. %s' % (retorno.estado.mensagem), 
                                retorno.estado.codMensagem, 
                                retorno.estado.excecao)
            
            # Inclusao na Iter.
            cIter = ClienteIter()
            retorno = cIter.obter(self)
            
            if not retorno.estado.ok and (retorno.estado.excecao or retorno.estado.httpStatus != 404):
                return Retorno(False, 
                                'Erro ao validar cadastro na Iter. %s' % (retorno.estado.mensagem), 
                                retorno.estado.codMensagem, 
                                retorno.estado.excecao)

            # salva na base da Iter.
            elif retorno.estado.httpStatus == 404:
                retorno = cIter.incluir(self)
            else:
                retorno = cIter.alterar(self)
            
            if not retorno.estado.ok:
                return Retorno(False, 
                                'Erro ao efetivar cadastro na Iter. %s' % (retorno.estado.mensagem), 
                                retorno.estado.codMensagem, 
                                retorno.estado.excecao)

            d_cliente_iter = retorno.json()
            self.id_cliente_iter = d_cliente_iter['dados']['id']

            # salva na base da Trisafe
            self.save()
            
            retorno = Retorno(True, 'Cadastro realizado com sucesso.', 200)
            retorno.dados = self

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno
    
    def alterar(self):
        try:
            retorno = Cliente.validar_dados_obrigatorios(self)
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o cliente já está cadastrado.
            retorno = Cliente.obter(self)

            if not retorno.estado.ok:
                return retorno
            
            m_cliente = retorno.dados
            self.id_cliente_iter = m_cliente.id_cliente_iter

            # Alteracao na Iter.
            cIter = ClienteIter()
            retorno = cIter.alterar(self)
            
            if not retorno.estado.ok:
                return retorno

            m_cliente.converter_de_cliente_iter(retorno.json())
            m_cliente.save()
            
            retorno = Retorno(True, 'Cadastro atualizado com sucesso.', 200)
            retorno.dados = m_cliente

            return retorno
        except Exception as e:
            print(traceback.format_exception(None, e, e.__traceback__), file=sys.stderr, flush=True)
                    
            retorno = Retorno(False, 'Falha de comunicação. Em breve será normalizado.', '', 500, e)
            return retorno
    
    def converter_de_cliente_iter(self, d_cliente_iter):
        if d_cliente_iter:
            dados = d_cliente_iter['dados']
            if dados:
                self.id_cliente_iter = dados['id']
                self.nome = dados['name']
                # self.nome_usuario = dados['username']
                self.cpf = dados['document']
                self.rua = dados['street']
                self.numero = dados['number']
                self.complemento = dados['complement_address']
                self.cep = dados['zipcode']
                self.bairro = dados['district']
                self.cidade = dados['city']
                self.uf = dados['state']
                self.telefone = dados['phone']
                self.email = dados['email']

    def validar_dados_obrigatorios_chaves(self):
        if len(str(self.cpf).strip()) <= 0 and len(str(self.email).strip()) <= 0:
            return Retorno(False, "Informe o CPF e/ou E-Mail.", 406)

        return Retorno(True)
    
    def validar_dados_obrigatorios(self):
        
        retorno = Cliente.validar_dados_obrigatorios_chaves(self)
            
        if not retorno.estado.ok:
            return retorno

        if len(str(self.nome).strip()) <= 0:
            return Retorno(False, "Informe o nome.", 406)
        return Retorno(True)
    
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        ret = {
            "id_cliente_iter": self.id_cliente_iter,
            "nome": self.nome,
            "nome_usuario": self.nome_usuario,
            "cpf": self.cpf,
            "rg": self.rg,
            "rua": self.rua,
            "numero": self.numero,
            "complemento": self.complemento,
            "cep": self.cep,
            "bairro": self.bairro,
            "cidade": self.cidade,
            "uf": self.uf,
            "telefone": self.telefone,
            "email": self.email,
            }
        return ret

    def __str__(self):
        return self.nome