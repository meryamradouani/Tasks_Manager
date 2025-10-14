# Déploiement Kubernetes - Task Manager

Ce guide explique comment déployer l'application Task Manager sur un cluster Kubernetes.

## 📋 Prérequis

1. **Kubernetes** installé (Minikube, Docker Desktop avec K8s, ou un cluster cloud)
2. **kubectl** configuré et connecté à votre cluster
3. **Docker** pour construire les images
4. **(Optionnel) Nginx Ingress Controller** pour l'ingress

## 🏗️ Architecture Kubernetes

```
┌─────────────────────────────────────────┐
│          Ingress (nginx)                │
│     taskmanager.local                   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼──────┐    ┌────────▼────────┐
│   Frontend   │    │    Backend      │
│   Service    │    │    Service      │
│  (LoadBalancer)   │   (ClusterIP)   │
└───────┬──────┘    └────────┬────────┘
        │                    │
┌───────▼──────┐    ┌────────▼────────┐
│  Frontend    │    │   Backend       │
│  Deployment  │    │   Deployment    │
│  (2 replicas)│    │  (2 replicas)   │
└──────────────┘    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ PersistentVolume│
                    │   (uploads)     │
                    └─────────────────┘
```

## 🚀 Étapes de Déploiement

### 1. Construire les Images Docker

```bash
# Backend
docker build -t taskmanager-backend:latest ./backend

# Frontend
docker build -t taskmanager-frontend:latest ./frontend/client
```

**Note pour Minikube** : Si vous utilisez Minikube, utilisez son daemon Docker :
```bash
eval $(minikube docker-env)
# Puis reconstruisez les images
```

### 2. Créer le Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 3. Créer les Secrets et ConfigMaps

⚠️ **IMPORTANT** : Modifiez `k8s/secrets.yaml` avec vos vraies valeurs avant de déployer en production !

```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
```

### 4. Créer le Stockage Persistant

```bash
kubectl apply -f k8s/persistent-volume.yaml
```

### 5. Déployer le Backend

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

Vérifier le déploiement :
```bash
kubectl get pods -n taskmanager
kubectl logs -n taskmanager -l app=backend
```

### 6. Déployer le Frontend

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### 7. (Optionnel) Configurer l'Ingress

Si vous avez un Ingress Controller (nginx) :

```bash
# Installer nginx ingress (si pas déjà fait)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Appliquer l'ingress
kubectl apply -f k8s/ingress.yaml

# Ajouter à votre fichier hosts (Windows: C:\Windows\System32\drivers\etc\hosts)
# <EXTERNAL-IP> taskmanager.local
```

## 🔍 Vérification du Déploiement

### Vérifier tous les pods
```bash
kubectl get all -n taskmanager
```

### Vérifier les logs
```bash
# Backend
kubectl logs -n taskmanager -l app=backend --tail=50

# Frontend
kubectl logs -n taskmanager -l app=frontend --tail=50
```

### Vérifier les services
```bash
kubectl get svc -n taskmanager
```

### Accéder à l'application

**Avec LoadBalancer** :
```bash
kubectl get svc frontend-service -n taskmanager
# Utilisez l'EXTERNAL-IP affichée
```

**Avec Minikube** :
```bash
minikube service frontend-service -n taskmanager
```

**Avec Port-Forward** (pour tester) :
```bash
# Frontend
kubectl port-forward -n taskmanager svc/frontend-service 8080:80

# Backend
kubectl port-forward -n taskmanager svc/backend-service 5000:5000
```

Puis accédez à : http://localhost:8080

## 📊 Monitoring et Debugging

### Voir les événements
```bash
kubectl get events -n taskmanager --sort-by='.lastTimestamp'
```

### Décrire un pod
```bash
kubectl describe pod -n taskmanager <pod-name>
```

### Accéder à un pod
```bash
kubectl exec -it -n taskmanager <pod-name> -- /bin/sh
```

### Vérifier les ressources
```bash
kubectl top pods -n taskmanager
kubectl top nodes
```

## 🔄 Mise à Jour de l'Application

1. Reconstruire l'image avec un nouveau tag :
```bash
docker build -t taskmanager-backend:v2 ./backend
```

2. Mettre à jour le deployment :
```bash
kubectl set image deployment/backend -n taskmanager backend=taskmanager-backend:v2
```

3. Vérifier le rollout :
```bash
kubectl rollout status deployment/backend -n taskmanager
```

4. Rollback si nécessaire :
```bash
kubectl rollout undo deployment/backend -n taskmanager
```

## 🔧 Scaling

### Augmenter le nombre de replicas
```bash
kubectl scale deployment backend -n taskmanager --replicas=3
kubectl scale deployment frontend -n taskmanager --replicas=3
```

### Autoscaling (HPA)
```bash
kubectl autoscale deployment backend -n taskmanager --cpu-percent=70 --min=2 --max=5
```

## 🗑️ Nettoyage

Pour supprimer toute l'application :
```bash
kubectl delete namespace taskmanager
```

Ou supprimer individuellement :
```bash
kubectl delete -f k8s/
```

## 📝 Configuration des Ressources

Les limites de ressources sont définies dans les deployments :

**Backend** :
- Requests: 256Mi RAM, 250m CPU
- Limits: 512Mi RAM, 500m CPU

**Frontend** :
- Requests: 128Mi RAM, 100m CPU
- Limits: 256Mi RAM, 200m CPU

Ajustez selon vos besoins dans les fichiers `*-deployment.yaml`.

## 🔐 Sécurité

⚠️ **Avant la production** :

1. **Secrets** : Ne commitez JAMAIS `secrets.yaml` avec de vraies valeurs
   - Utilisez des outils comme Sealed Secrets ou External Secrets Operator
   - Ou créez les secrets manuellement : 
     ```bash
     kubectl create secret generic taskmanager-secrets \
       --from-literal=MONGO_URI='...' \
       --from-literal=JWT_SECRET='...' \
       -n taskmanager
     ```

2. **HTTPS** : Configurez TLS dans l'Ingress
3. **Network Policies** : Limitez la communication entre pods
4. **RBAC** : Configurez les permissions appropriées

## 🌐 Déploiement Cloud

### Google Kubernetes Engine (GKE)
```bash
gcloud container clusters create taskmanager-cluster --num-nodes=3
gcloud container clusters get-credentials taskmanager-cluster
```

### Amazon EKS
```bash
eksctl create cluster --name taskmanager --region us-west-2 --nodes 3
```

### Azure AKS
```bash
az aks create --resource-group myResourceGroup --name taskmanager --node-count 3
az aks get-credentials --resource-group myResourceGroup --name taskmanager
```

## 📚 Ressources Utiles

- [Documentation Kubernetes](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

## 🆘 Problèmes Courants

### Les pods ne démarrent pas
```bash
kubectl describe pod -n taskmanager <pod-name>
# Vérifiez les événements et les erreurs
```

### Images non trouvées
- Vérifiez que les images sont bien construites
- Pour Minikube, utilisez `eval $(minikube docker-env)`
- Ou poussez les images vers un registry

### Problèmes de connexion Backend
- Vérifiez que MongoDB est accessible
- Vérifiez les secrets et variables d'environnement
- Vérifiez les logs du backend

### Problèmes de stockage
- Vérifiez que le PersistentVolume est bien créé
- Pour Minikube : `minikube ssh` puis `sudo mkdir -p /mnt/data/taskmanager/uploads`
