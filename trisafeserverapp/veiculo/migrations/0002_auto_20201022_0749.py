# Generated by Django 2.2.14 on 2020-10-22 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('veiculo', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='veiculo',
            name='foto_doc',
            field=models.ImageField(upload_to='data/fotos_docs_veiculos'),
        ),
    ]