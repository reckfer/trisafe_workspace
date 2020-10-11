import json
import sys
import traceback
from django.db import models
from rest_framework import status
from cliente.models import Cliente
from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno

class Veiculo(models.Model, GerenciadorLog):

    placa = models.CharField(primary_key=True, max_length=7, null=False, unique=True)
    modelo = models.CharField(max_length=20, null=True, unique=False)
    marca = models.CharField(max_length=20, null=True, unique=False)
    ano = models.CharField(max_length=20, null=True, unique=False)
    apelido = models.CharField(max_length=20, null=True, unique=False)
    foto_doc = models.ImageField(upload_to='data/fotos_docs_veiculos')
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, blank=False, null=False)
    dt_hr_inclusao = models.DateTimeField(blank=False, null=False, auto_now_add=True)
    ult_atualizacao = models.DateTimeField(blank=False, null=False, auto_now=True)
    
    def incluir(self):
        try:
            retorno = self.validar_dados_obrigatorios(self)
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o veiculo já está cadastrado.
            retorno = self.obter(self)

            if retorno.estado.codMensagem != 'NaoCadastrado':
                return retorno

            self.save()
            
            retorno = Retorno(True, self, 'Cadastro realizado com sucesso.', 200)
            retorno.dados = self

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão dos dados cadastrais do veículo falhou.', None, None, e)
            return retorno

    def obter(self):
        try:
            retorno = self.validar_dados_obrigatorios_chaves()
                
            if not retorno.estado.ok:
                return retorno

            retorno = Retorno(False, self, 'Veiculo não cadastrado', 'NaoCadastrado', 406)
            
            m_veiculo = Veiculo.objects.get(placa=self.placa)
            if(m_veiculo and m_veiculo.placa):
                
                if m_veiculo:
                    retorno = Retorno(True, self)
                    retorno.dados = self.definir_contexto(m_veiculo)
            
            return retorno

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta aos dados cadastrais do veículo falhou.', None, None, e)
            return retorno
    
    def listar_por_cliente(self):
        try:
            retorno = Retorno(False, self, 'Nenhum veículo cadastrado para o Cliente.', 'NaoCadastrado')
            
            m_veiculos = Veiculo.objects.filter(cliente__cpf=self.cliente.cpf)
            
            if m_veiculos:
                retorno = Retorno(True, self)
                retorno.dados = m_veiculos

            return retorno

        except Exception as e:
                    
            retorno = Retorno(False, self, 'A consulta aos veículos do cliente falhou.', None, None, e)
            return retorno
    
    def validar_dados_obrigatorios_chaves(self):
        if not self.placa or len(str(self.placa).strip()) <= 0 :
            return Retorno(False, self, "Informe a placa do veículo.", 406)

        return Retorno(True, self)
    
    def validar_dados_obrigatorios(self):
        
        retorno = self.validar_dados_obrigatorios_chaves(self)
        
        if not retorno.estado.ok:
            return retorno

        if not self.cliente:
            return Retorno(False, self, "Informe o cliente proprietário do veículo.", 406)

        return Retorno(True, self)
    
    def json(self):
        return self.__criar_json__()
    
    def __criar_json__(self):
        ret = {
                "placa": self.placa,
                "modelo": self.modelo,
                "marca": self.marca,
                "ano": self.ano,
                "apelido": self.apelido,
                "uri_foto_doc": self.foto_doc.url,
                "cliente": self.cliente.json(),
                #"dt_hr_inclusao": self.dt_hr_inclusao
            }
        return ret

    def __str__(self):
        return self.placa