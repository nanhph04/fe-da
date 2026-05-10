# Plan: Phân nhóm giao diện & Tham chiếu HTML Mockup trong AGENTS.md

- **Ngày viết:** 2026-05-10
- **Trạng thái:** ✅ Hoàn thành
- **Ngày hoàn thành:** 2026-05-10

---

## Mục tiêu

Bổ sung vào `AGENTS.md` Section 26 (**Interface Groups & HTML Mockup Reference**) để:

1. **Phân nhóm 37 giao diện mẫu** thành 4 nhóm: Public/Auth, Viewer, Creator, Admin.
2. Cung cấp **bảng mapping** mockup folder → route → feature → trạng thái.
3. Đưa ra **quy tắc đồng bộ visual** cho từng nhóm.
4. Tạo **Mockup Lookup Protocol** cho AI tra cứu khi code/refactor.

---

## Phân nhóm

| Nhóm | Số lượng | Đối tượng | Prefix route |
|------|----------|-----------|-------------|
| Public / Auth | 6 | Guest | `/(auth)`, `/(main)/landing` |
| Viewer / User | 9 | Viewer đã đăng nhập | `/(main)/*` |
| Creator / Studio | 10 | Creator | `/studio/*` |
| Admin Console | 12 | Admin | `/admin/*` |

---

## Thay đổi thực hiện

### [MODIFY] AGENTS.md

- Thêm Section 26 (~200 dòng) trước phần "Prompt mẫu"
- Sub-sections: 26.1 (nhóm), 26.2 (bảng mapping), 26.3 (visual rules), 26.4 (protocol), 26.5 (cập nhật trạng thái)
- Loại bỏ `aura_cinematic` (file nhầm, user đã xóa)

---

## Ghi chú

- Các giao diện đánh ⚠️ cần kiểm tra thực tế khi bắt đầu refactor.
- `DESIGN.md` vẫn là Single Source of Truth cho design tokens; mockup là tham chiếu cho layout/cấu trúc.
