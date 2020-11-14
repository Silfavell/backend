class ErrorMessages {
    static NO_PERMISSION = 'Bu veriye ulaşmak için yetkiniz yok'

    static WRONG_ACTIVATION_CODE = 'Hatalı aktivasyon kodu'

    static UNEXPECTED_ERROR = 'Beklenmedik bir hata oluştu, lütfen daha sonra tekrar deneyiniz'

    static USER_ALREADY_EXISTS = 'Telefon numarasına ait kullanıcı var'

    static USER_IS_NOT_EXISTS = 'Telefon numarasına ait kullanıcı bulunamadı'

    static NON_EXISTS_PRODUCT = 'Ürün bulunamadı'

    static NON_EXISTS_PRODUCT_IN_CART = 'Ürün sepette bulunamadı'

    static WRONG_PASSWORD = 'Hatalı şifre'

    static EMPTY_CART = 'Lütfen sepetinize ürün ekleyiniz'

    static NO_ADDRESS = 'Lütfen adres seçiniz'

    static WRONG_PHONE_OR_PASSWORD = 'Hatalı telefon ya da şifre'

    static UNKNOWN_TYPE_OF_ACTIVATION_CODE = 'Aktivasyon tipi bulunamadı'

    static UNKNOWN_ACTIVATION_CODE = 'Aktivasyon kodu bulunamadı'

    static INVALID_PHONE_NUMBER = 'Geçersiz telefon numarası'

    static UNKNOWN_OBJECT_ID = 'UNKNOWN_OBJECT_ID'

    static ANOTHER_PRODUCT_WITH_THE_SAME_NAME = 'Aynı isimde başka bir ürün var! Lütfen tekil bir isim kullanınız.'

    static ANOTHER_CATEGORY_WITH_THE_SAME_NAME = 'Aynı isimde başka bir kategori var! Lütfen tekil bir isim kullanınız.'

    static ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME = 'Aynı isimde başka bir alt kategori var! Lütfen tekil bir isim kullanınız.'

    static ANOTHER_TYPE_WITH_THE_SAME_NAME = 'Aynı isimde başka bir ürün tipi var! Lütfen tekil bir isim kullanınız.'


    static MANAGER_ALREADY_EXISTS = 'Telefon numarasına ait yönetici var'

    static MANAGER_IS_NOT_EXISTS = 'Telefon numarasına ait yönetici bulunamadı'

    static MANAGER_IS_NOT_VERIFIED = 'Yönetici henüz onaylanmamış'


    static CATEGORY_IS_NOT_EXISTS = 'Kategori mevcut değil.'

    static CAN_NOT_DELETE_CATEGORY = 'This Category can not be deletable since there are SubCategories belongs to this Category.'

    static CAN_NOT_DELETE_SUB_CATEGORY = 'This SubCategory can not be deletable since there are products belongs to this SubCategory.'

    static CAN_NOT_DELETE_TYPE = 'This Type can not be deletable since there are products belongs to this Type.'
}

export default ErrorMessages