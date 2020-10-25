import json
import sys
import traceback
import base64
from django.core.files.base import ContentFile
from django.db import models
from rest_framework import status
from clienteiter.models import ClienteIter
from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno
from trisafeserverapp.settings import BASE_DIR
import os

class Cliente(models.Model, GerenciadorLog):
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
    id_signatario_contrato = models.CharField(max_length=100, null=True)
    foto_cnh = models.ImageField(upload_to='data/fotos_cnh', null=True)
    
    def obter(self):
        try:
            retorno = Cliente.validar_dados_obrigatorios_chaves(self)
                
            if not retorno.estado.ok:
                return retorno

            retorno = Retorno(False, self, 'Cliente não cadastrado', 'NaoCadastrado', 406)
            
            # Valida se o cliente já está cadastrado.
            lista_clientes = Cliente.objects.filter(cpf=self.cpf)
            if lista_clientes:

                m_cliente = lista_clientes[0]

                if m_cliente:
                    self.definir_contexto(m_cliente)
                    retorno = Retorno(True, self)
                    
                    if(self.credencial_iter.chave_iter_cli and len(self.credencial_iter.chave_iter_cli) > 0):
                        o_cliente_iter = ClienteIter(self)
                        # Obtem o cadastro na Iter.
                        retorno = o_cliente_iter.obter(m_cliente)
                        
                        if not retorno.estado.ok:
                            return retorno
                    
                        m_cliente.converter_de_cliente_iter(retorno.json())
                        m_cliente.nome_usuario = m_cliente.nome_usuario
                    
                    retorno.dados = self.definir_contexto(m_cliente)
            
            return retorno
        except Exception as e:
                     
            retorno = Retorno(False, self, 'A consulta dos dados cadastrais falhou.', None, None, e)
            return retorno

    def obter_ultimo(self):
        try:
            retorno = Retorno(False, self)
            # Valida se o cliente já está cadastrado.
            lista_clientes = Cliente.objects.filter()
            if lista_clientes:
                m_cliente = lista_clientes[lista_clientes.count()-1]
                if m_cliente:
                    o_cliente_iter = ClienteIter(self)
                    # Obtem o cadastro na Iter.
                    retorno = o_cliente_iter.obter(m_cliente)
                    
                    if not retorno.estado.ok:
                        return retorno
                    
                    m_cliente.converter_de_cliente_iter(retorno.json())
                    m_cliente.nome_usuario = m_cliente.nome_usuario
                    
                    retorno.dados = self.definir_contexto(m_cliente)
            
            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta dos dados cadastrais falhou.', None, None, e)
            return retorno
                
    def incluir(self):
        try:
            retorno = Cliente.validar_dados_obrigatorios(self)
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o cliente já está cadastrado.
            retorno = Cliente.obter(self)
    
            if retorno.estado.excecao or (len(retorno.estado.codMensagem) > 0 and retorno.estado.codMensagem != 'NaoCadastrado'):
                return Retorno(False, self, 'Erro ao validar cadastro. %s' % (retorno.estado.mensagem), 
                                retorno.estado.codMensagem, 
                                retorno.estado.excecao)
            
            o_cliente_iter = ClienteIter(self)
            # Inclusao na Iter.
            retorno = o_cliente_iter.obter(self)
            
            if not retorno.estado.ok and (retorno.estado.excecao or retorno.estado.httpStatus != 404):
                return Retorno(False, self, 'Erro ao validar cadastro na Iter. %s' % (retorno.estado.mensagem), 
                                retorno.estado.codMensagem, 
                                retorno.estado.excecao)

            # salva na base da Iter.
            elif retorno.estado.httpStatus == 404:
                retorno = o_cliente_iter.incluir(self)
            else:
                retorno = o_cliente_iter.alterar(self)
            
            if not retorno.estado.ok:
                return Retorno(False, self, 'Erro ao efetivar cadastro na Iter. %s' % (retorno.estado.mensagem), 
                                retorno.estado.codMensagem, 
                                retorno.estado.excecao)

            d_cliente_iter = retorno.json()
            self.id_cliente_iter = d_cliente_iter['dados']['id']

            # salva na base da Trisafe
            self.save()

            retorno = Retorno(True, self, 'Cadastro realizado com sucesso.', '', 200, None)
            retorno.dados = self

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão dos dados cadastrais falhou.', None, None, e)
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
            
            if(self.credencial_iter.chave_iter_cli and len(self.credencial_iter.chave_iter_cli) > 0):
                self.id_cliente_iter = m_cliente.id_cliente_iter

                o_cliente_iter = ClienteIter(self)
                # Alteracao na Iter.
                retorno = o_cliente_iter.alterar(self)
                
                if not retorno.estado.ok:
                    return retorno

                m_cliente.converter_de_cliente_iter(retorno.json())
            
            m_cliente.id_signatario_contrato = self.id_signatario_contrato
            m_cliente.save()
            
            retorno = Retorno(True, self, 'Cadastro atualizado com sucesso.', '', 200, None)
            retorno.dados = m_cliente

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A atualização dos dados cadastrais falhou.', None, None, e)
            return retorno

    def salvar_foto_cnh(self, foto_cnh_base64):
        try:
            # Valida se o cliente está cadastrado.
            retorno = self.obter()

            if not retorno.estado.ok:
                return retorno
            
            m_cliente = retorno.dados
            
            nome_arquivo = "foto_cnh_%s.jpg" % self.cpf

            foto_cnh = base64.b64decode(foto_cnh_base64)

            m_cliente.foto_cnh.save(nome_arquivo, ContentFile(foto_cnh))
            m_cliente.save()

            retorno = Retorno(True, self, 'Foto da CNH recebida com sucesso.', 200, None)

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão da foto da CNH falhou.', None, None, e)
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
            return Retorno(False, self, "Informe o CPF e/ou E-Mail.", 406)

        return Retorno(True, self)
    
    def validar_dados_obrigatorios(self):
        
        retorno = Cliente.validar_dados_obrigatorios_chaves(self)
            
        if not retorno.estado.ok:
            return retorno

        if len(str(self.nome).strip()) <= 0:
            return Retorno(False, self, "Informe o nome.", 406)
        return Retorno(True, self)
    
    def json(self):
        return self.__criar_json__()

    def __criar_json__(self):
        url_foto = ''
        
        try:
            url_foto = self.foto_cnh.url
        except Exception:
            pass

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
            'id_signatario_contrato': self.id_signatario_contrato,
            "foto_cnh": {
                'url': url_foto,
                'foto_base64': '',
            },
        }
        return ret

    def __str__(self):
        return self.nome