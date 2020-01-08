import * as k8s from '@kubernetes/client-node';
import { getMaxWorkers } from './config';

const { DEPLOYMENT_NAME = '' } = process.env;

export class KubernetesClient {
  private static kubeConfig: k8s.KubeConfig;
  private static kubeClient: k8s.AppsV1Api;

  public static initialize = () => {
    KubernetesClient.kubeConfig = new k8s.KubeConfig();
    KubernetesClient.kubeConfig.loadFromCluster();
    KubernetesClient.kubeClient = KubernetesClient.kubeConfig.makeApiClient(k8s.AppsV1Api);
  };

  public static scaleUpDeployment = async () => {
    console.log('Getting current worker deployment replica count');
    const deploymentScale = await KubernetesClient.kubeClient.readNamespacedDeploymentScale(DEPLOYMENT_NAME, 'spiritbomb');
    let scaleUp = deploymentScale.body.status?.replicas;
    if (scaleUp !== 0 && !scaleUp) throw new Error('Error getting current replica count from kubernetes');
    scaleUp += 1;
    if (scaleUp <= (await getMaxWorkers())) {
      console.log(`Scaling up worker replicas to ${scaleUp}`);
      await KubernetesClient.kubeClient.patchNamespacedDeploymentScale(DEPLOYMENT_NAME, 'spiritbomb', { spec: { replicas: scaleUp } }, undefined, undefined, undefined, undefined, {
        headers: { 'Content-Type': 'application/merge-patch+json' }
      });
    } else {
      console.log(`Want to scale up to ${scaleUp}, but no more workers are allowed. Not scaling up.`);
    }
  };

  public static scaleDownDeployment = async () => {
    console.log('Getting current worker deployment replica count');
    const deploymentScale = await KubernetesClient.kubeClient.readNamespacedDeploymentScale(DEPLOYMENT_NAME, 'spiritbomb');
    let scaleDown = deploymentScale.body.status?.replicas;
    if (scaleDown !== 0 && !scaleDown) throw new Error('Error getting current replica count from kubernetes');
    scaleDown -= 1;
    if (scaleDown < 0) scaleDown = 0;
    console.log(`Scaling down worker replicas to ${scaleDown}`);
    await KubernetesClient.kubeClient.patchNamespacedDeploymentScale(DEPLOYMENT_NAME, 'spiritbomb', { spec: { replicas: scaleDown } }, undefined, undefined, undefined, undefined, {
      headers: { 'Content-Type': 'application/merge-patch+json' }
    });
  };
}
