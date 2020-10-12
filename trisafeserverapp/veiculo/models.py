import json
import sys
import traceback
import base64
import PIL
from PIL import Image
from django.core.files.storage import FileSystemStorage
from django.db import models
from rest_framework import status
from cliente.models import Cliente
from gerenciadorlog.models import GerenciadorLog
from comum.retorno import Retorno
from trisafeserverapp.settings import BASE_DIR
import os

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
            retorno = self.validar_dados_obrigatorios()
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o veiculo já está cadastrado.
            retorno = self.obter()

            if retorno.estado.codMensagem != 'NaoCadastrado':
                return retorno

            self.save()
            
            retorno = Retorno(True, self, 'Cadastro realizado com sucesso.', 200)
            retorno.dados = self

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão dos dados cadastrais do veículo falhou.', None, None, e)
            return retorno
        
    def alterar(self):
        try:
            retorno = self.validar_dados_obrigatorios()
            
            if not retorno.estado.ok:
                return retorno

            # Valida se o veiculo já está cadastrado.
            retorno = self.obter()

            if not retorno.estado.ok:
                return retorno

            vaiculo_cadastrado = retorno.dados
            self.cliente = vaiculo_cadastrado.cliente
            self.dt_hr_inclusao = vaiculo_cadastrado.dt_hr_inclusao
            self.save()
            
            retorno = Retorno(True, self, 'Cadastro atualizado com sucesso.', 200)
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
    
    def salvar_foto_doc(self, foto_doc_base64):
        try:
            # Valida se o veiculo já está cadastrado.
            retorno = self.obter()

            if not retorno.estado.ok:
                return retorno
            
            self.cliente = retorno.dados.cliente
            
            nome_arquivo = "foto_doc_%s.jpg" % self.cliente.cpf

            # caminho_arquivo = os.path.join(BASE_DIR, self.foto_doc.upload_to, nome_arquivo)
            # if(os.path.exists(caminho_arquivo)):
            #     os.remove(caminho_arquivo)
            
            # caminho_diretorio = os.path.join(BASE_DIR, self.foto_doc.upload_to)
            # if(not os.path.exists(caminho_diretorio)):
            #     os.makedirs(caminho_diretorio)
            
            foto_doc = base64.b64decode(foto_doc_base64)

            # file = open(caminho_arquivo, 'wb')
            # file.write(foto_cnh)
            # file.close()
            Image.new('w', len(foto_doc_base64))
            fs = FileSystemStorage(location='data/fotos_docs_veiculos')
            arquivo = fs.open(nome_arquivo, 'wb')
            arquivo.file.write(foto_doc)
            arquivo.file.close()
            #fs.save(nome_arquivo, arquivo)

            self.foto_doc = models.ImageField(storage=fs)
            self.save()
            
            fs.close()

            retorno = Retorno(True, self, 'CNH recebida com sucesso.', 200, None)

            return retorno
        except Exception as e:
                    
            retorno = Retorno(False, self, 'A inclusão da foto da CNH falhou.', None, None, e)
            return retorno

    def validar_dados_obrigatorios_chaves(self):
        if not self.placa or len(str(self.placa).strip()) <= 0 :
            return Retorno(False, self, "Informe a placa do veículo.", 406)

        return Retorno(True, self)
    
    def validar_dados_obrigatorios(self):
        
        retorno = self.validar_dados_obrigatorios_chaves()
        
        if not retorno.estado.ok:
            return retorno

        if not self.cliente:
            return Retorno(False, self, "Informe o cliente proprietário do veículo.", 406)

        return Retorno(True, self)
    
    def json(self):
        return self.__criar_json__()
    
    def __criar_json__(self):
        url_foto = ''
        
        try:
            url_foto = self.foto_doc.url
        except Exception:
            pass

        ret = {
                "placa": self.placa,
                "modelo": self.modelo,
                "marca": self.marca,
                "ano": self.ano,
                "apelido": self.apelido,
                "foto_doc": {
                    'url': url_foto,
                    'foto_base64': '',
                },
                "cliente": self.cliente.json(),
            }
        return ret

    def __str__(self):
        return self.placa