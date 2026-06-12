# HandsOn W9 — Observability + Canary

## Mục tiêu

Repo này chứa GitOps để:
- Cài đặt `kube-prometheus-stack` và `argo-rollouts` qua ArgoCD
- Triển khai app `api` dưới dạng `Rollout`
- Thu thập metric Prometheus bằng `ServiceMonitor`
- Giữ `Alertmanager` gửi email
- Dùng Argo Rollouts canary với `AnalysisTemplate` để tự động abort khi metric xấu

## Nội dung chính

- `gitops/argocd/apps/kube-prometheus-stack.yaml`
  - Cài `kube-prometheus-stack` bằng ArgoCD
  - Thiết lập `Alertmanager` gửi email tới `nguyenkhang.28102004@gmail.com`
- `gitops/argocd/apps/argo-rollouts.yaml`
  - Cài `argo-rollouts` bằng ArgoCD
- `gitops/k8s-api/api.yaml`
  - Định nghĩa `Rollout` cho service `api`
  - Dùng `strategy.canary` với các bước `setWeight` + `pause`
  - Đính kèm `analysis.templates` để canary tự đánh giá
- `gitops/k8s-api/servicemonitor.yaml`
  - Cho Prometheus thu thập metric từ service `api`

## Các bước đã thực hiện

1. Tạo `Application` GitOps cho `kube-prometheus-stack` và `argo-rollouts`.
2. Viết manifest `Rollout` cho app `api`.
3. Tạo `ServiceMonitor` để Prometheus scrape `/metrics`.
4. Dùng `ArgoCD` để sync và tạo namespace/ứng dụng tự động.
5. Dùng `Argo Rollouts` để thả canary và gắn auto-analysis.

## Cách kiểm tra

### 1. Kiểm tra ArgoCD

- `kubectl -n argocd get applications`
- `kubectl -n argocd port-forward svc/argocd-server 8080:443`
- Mở ArgoCD web UI để xác nhận `kube-prometheus-stack`, `argo-rollouts` và app `api` đã sync.

### 2. Kiểm tra Prometheus

- `kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090`
- Mở `http://localhost:9090`
- Tìm target `api` hoặc query metric:
  - `flask_http_request_total{namespace="demo"}`

### 3. Kiểm tra Alertmanager

- `kubectl -n monitoring port-forward svc/kube-prometheus-stack-alertmanager 9093:9093`
- Xác nhận cấu hình mail đã được nạp.

### 4. Kiểm tra Rollout

- `kubectl get rollout api -n demo`
- `kubectl argo rollouts get rollout api -n demo --watch`
- Kiểm tra canary đang chạy dừng tại bước `pause`/`analysis`.

### 5. Kiểm tra tự động abort

- Đảm bảo `gitops/k8s-api/api.yaml` có `analysis.templates` và `Rollout` có `canary.steps`.
- Inject lỗi vào app (ví dụ chỉnh `ERROR_RATE` hoặc dùng image lỗi) rồi push Git.
- Quan sát Rollout tự `abort` và rollback nếu metric không đạt.

## Các ảnh/chứng minh nên chụp

1. ArgoCD Web UI
   - `kube-prometheus-stack` đã sync
   - `argo-rollouts` đã sync
   - `api` Rollout đã sync và không drift

2. Prometheus Targets
   - `api` target trạng thái `UP`

3. Alertmanager
   - Cấu hình receiver email
   - lịch sử alert (alert firing)

4. Rollout canary
   - Trạng thái `Rollout` khi đang ở `25%` hoặc `50%`
   - Trạng thái `Rollout` sau khi auto-abort

5. Git evidence
   - `git log --oneline` hoặc commit chứa thay đổi `api` và `AnalysisTemplate`
   - `git revert` rollback trong Git

6. Nếu có thể, video/ảnh minh hoạ
   - Thực hiện deploy thay đổi qua Git
   - Thấy ArgoCD sync
   - Thấy Rollout tự abort
   - Thấy app rollback về bản cũ

## Gợi ý file cần nộp

- `README.md` (nội dung này)
- `gitops/argocd/apps/kube-prometheus-stack.yaml`
- `gitops/argocd/apps/argo-rollouts.yaml`
- `gitops/k8s-api/api.yaml`
- `gitops/k8s-api/servicemonitor.yaml`

## Lưu ý đặc biệt

- Nếu app `api` dùng image local (`w9-api:1`), phải load image vào Minikube bằng `minikube image load w9-api:1 -p w9`.
- `imagePullPolicy: IfNotPresent` là cần thiết để Kubernetes không kéo image từ registry.
- Alert gửi email cá nhân sẽ phụ thuộc vào cấu hình SMTP và mạng.

---

Những nội dung này đủ để bạn giải thích, chứng minh và chụp bằng chứng cho bài tập "Ship Smartly".