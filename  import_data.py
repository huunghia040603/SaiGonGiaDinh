import os
import django
import pandas as pd
from decimal import Decimal

# Cấu hình môi trường Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BuddyProject.settings')
django.setup()

# Import models sau khi đã setup Django
from BuddyApp.models import Product, Brand, Category, Tag, Gift
from django.db import IntegrityError

def import_products_from_excel(file_path):
    """
    Nhập dữ liệu sản phẩm từ file CSV vào database Django.
    """
    
    status_mapping = {
        'Used test': 'test',
        'Used 95%': '95',
        'New': 'new',
        'New rách tem': 'newrt',
        'New xước': 'newx',
        'New mất hộp': 'newmh',
        'Used 90%': '90',
        'New móp hộp nhẹ': 'newmn',
        'New xước nhẹ': 'newxn',
        'Chiết': 'chiet',
        'new': 'new',
        'new rách tem': 'newrt',
    }

    try:
        print("Đang đọc file dữ liệu...")
        # Sử dụng engine='python' và các tham số delimiter/quotechar để xử lý file CSV không nhất quán
        df = pd.read_csv(file_path, encoding='latin1', engine='python', delimiter=',', quotechar='"')
        print(f"Đã đọc thành công {len(df)} dòng dữ liệu.")
        
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file tại đường dẫn: {file_path}")
        return
    except Exception as e:
        print(f"Đã xảy ra lỗi khi đọc file: {e}")
        print("Vui lòng kiểm tra lại cấu trúc file CSV của bạn, đặc biệt là các dấu phẩy bên trong các trường dữ liệu.")
        return

    # Lặp qua từng dòng để tạo hoặc cập nhật đối tượng Product
    for index, row in df.iterrows():
        try:
            # Lấy các đối tượng liên kết
            brand = Brand.objects.get(id=row['Hãng'])
            category = Category.objects.get(id=row['Danh mục'])
            
            # Xử lý các trường có thể bị rỗng
            stock_quantity = int(row['Số lượng kho']) if pd.notna(row['Số lượng kho']) else 0
            sold_quantity = int(row['Đã bán']) if pd.notna(row['Đã bán']) else 0
            rating = Decimal(str(row['Số sao'])) if pd.notna(row['Số sao']) else Decimal('0.0')
            import_price = Decimal(str(row['Giá nhập'])) if pd.notna(row['Giá nhập']) else Decimal('0.0')
            original_price = Decimal(str(row['Giá gốc'])) if pd.notna(row['Giá gốc']) else Decimal('0.0')
            discounted_price = Decimal(str(row['Giá bán'])) if pd.notna(row['Giá bán']) else Decimal('0.0')
            
            # Lấy các Tag
            tags = []
            if pd.notna(row['Tag Flash sale']):
                tag_ids = str(row['Tag Flash sale']).split(',')
                for tag_id in tag_ids:
                    if tag_id.strip():
                        tags.append(Tag.objects.get(id=int(tag_id)))
            
            # Lấy các Gift (nếu cột này tồn tại trong file CSV)
            gifts = []
            if 'Quà tặng' in df.columns and pd.notna(row['Quà tặng']):
                gift_ids = str(row['Quà tặng']).split(',')
                for gift_id in gift_ids:
                    if gift_id.strip():
                        gifts.append(Gift.objects.get(id=int(gift_id)))

            # Chuyển đổi trạng thái
            status_key = status_mapping.get(str(row['tình trạng']).strip(), 'new')

            # Tạo đối tượng Product
            product = Product(
                name=row['Tên'],
                description=row['Mô tả'],
                image=row['Ảnh 1'],
                brand=brand,
                category=category,
                stock_quantity=stock_quantity,
                sold_quantity=sold_quantity,
                rating=rating,
                import_price=import_price,
                original_price=original_price,
                discounted_price=discounted_price,
                status=status_key,
            )
            product.save()

            # Gán các trường ManyToMany
            product.tags.set(tags)
            product.gifts.set(gifts)

            print(f"✅ Đã nhập thành công sản phẩm: {product.name}")

        except ValueError as e:
            print(f"❌ Lỗi chuyển đổi dữ liệu cho sản phẩm '{row.get('Tên', 'Không rõ')}': {e}. Có thể dữ liệu không phải là số hoặc có khoảng trống.")
        except Brand.DoesNotExist:
            print(f"❌ Lỗi: Không tìm thấy Brand với ID '{row['Hãng']}'. Bỏ qua sản phẩm: {row['Tên']}")
        except Category.DoesNotExist:
            print(f"❌ Lỗi: Không tìm thấy Category với ID '{row['Danh mục']}'. Bỏ qua sản phẩm: {row['Tên']}")
        except Tag.DoesNotExist as e:
            print(f"❌ Lỗi: Không tìm thấy Tag với ID. Bỏ qua sản phẩm: {row['Tên']}")
        except Gift.DoesNotExist as e:
            print(f"❌ Lỗi: Không tìm thấy Gift với ID. Bỏ qua sản phẩm: {row['Tên']}")
        except IntegrityError as e:
            print(f"⚠️ Lỗi toàn vẹn dữ liệu cho sản phẩm {row['Tên']}: {e}. Có thể sản phẩm đã tồn tại.")
        except Exception as e:
            print(f"❌ Lỗi không xác định khi nhập sản phẩm '{row.get('Tên', 'Không rõ')}': {e}")


# Chạy hàm chính
if __name__ == "__main__":
    file_name = 'Sanpham.xlsx'
    import_products_from_excel(file_name)