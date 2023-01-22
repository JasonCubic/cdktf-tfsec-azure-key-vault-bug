// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider";
import { DataAzurermClientConfig } from "@cdktf/provider-azurerm/lib/data-azurerm-client-config";
import { ResourceGroup } from "@cdktf/provider-azurerm/lib/resource-group";
import { KeyVault } from "@cdktf/provider-azurerm/lib/key-vault";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AzurermProvider(this, 'azurerm-provider', {
      features: {
        keyVault: {
          purgeSoftDeleteOnDestroy: true,
          recoverSoftDeletedKeyVaults: true,
        },
      },
    });


    const dataAzurermClientConfigCurrent = new DataAzurermClientConfig(this, 'current', {});

    const keyVaultRg = new ResourceGroup(this, 'key-vault-resource-group', {
      location: 'East US',
      name: 'test-key-vault-rg',
    });

    new KeyVault(this, 'key-vault', {
      tenantId: dataAzurermClientConfigCurrent.tenantId,
      name: 'test-azure-key-vault1',
      location: keyVaultRg.location,
      resourceGroupName: keyVaultRg.name,
      skuName: 'standard',

      enabledForDeployment: true,
      enabledForDiskEncryption: true,
      enabledForTemplateDeployment: true,

      purgeProtectionEnabled: true,
      softDeleteRetentionDays: 7,

      networkAcls: {
        bypass: 'AzureServices',
        defaultAction: 'Deny',
      },
    });
  }
}

const app = new App();
new MyStack(app, "cdktf-tfsec-azure-key-vault-bug");
app.synth();
