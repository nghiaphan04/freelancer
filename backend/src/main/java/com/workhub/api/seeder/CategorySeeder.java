package com.workhub.api.seeder;

import com.workhub.api.entity.Category;
import com.workhub.api.entity.SubCategory;
import com.workhub.api.entity.SubCategoryTag;
import com.workhub.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Order(3)
@RequiredArgsConstructor
public class CategorySeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CategorySeeder.class);

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        logger.info("Starting Category Seeder...");

        if (categoryRepository.count() > 0) {
            logger.info("Categories already exist. Skipping CategorySeeder.");
            return;
        }

        List<Category> categories = Arrays.asList(
                buildCategory(
                        "Thi công & Xây dựng",
                        1,
                        Arrays.asList(
                                buildSubCategory("Thi công dân dụng", 1, Arrays.asList(
                                        buildTag("Nhà phố", true, 1),
                                        buildTag("Chung cư", false, 2),
                                        buildTag("Nhà xưởng", false, 3)
                                )),
                                buildSubCategory("Thi công công nghiệp", 2, Arrays.asList(
                                        buildTag("Hạ tầng", true, 1),
                                        buildTag("Đường - cầu", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "Thiết kế kiến trúc",
                        2,
                        Arrays.asList(
                                buildSubCategory("Thiết kế 2D", 1, Arrays.asList(
                                        buildTag("AutoCAD", true, 1),
                                        buildTag("Bản vẽ kỹ thuật", false, 2)
                                )),
                                buildSubCategory("Thiết kế 3D", 2, Arrays.asList(
                                        buildTag("SketchUp", true, 1),
                                        buildTag("3ds Max", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "BIM & Mô phỏng",
                        3,
                        Arrays.asList(
                                buildSubCategory("Revit", 1, Arrays.asList(
                                        buildTag("Model BIM", true, 1),
                                        buildTag("Family", false, 2)
                                )),
                                buildSubCategory("Navisworks", 2, Arrays.asList(
                                        buildTag("Clash Detection", true, 1),
                                        buildTag("4D Simulation", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "Vật liệu & Cung ứng",
                        4,
                        Arrays.asList(
                                buildSubCategory("Mua sắm vật tư", 1, Arrays.asList(
                                        buildTag("Báo giá", true, 1),
                                        buildTag("Nhà cung cấp", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "Dự toán & Hồ sơ thầu",
                        5,
                        Arrays.asList(
                                buildSubCategory("Dự toán", 1, Arrays.asList(
                                        buildTag("Bóc tách khối lượng", true, 1),
                                        buildTag("Lập dự toán", false, 2)
                                )),
                                buildSubCategory("Hồ sơ thầu", 2, Arrays.asList(
                                        buildTag("HSMT", true, 1),
                                        buildTag("HSĐT", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "Quản lý dự án",
                        6,
                        Arrays.asList(
                                buildSubCategory("Tiến độ", 1, Arrays.asList(
                                        buildTag("MS Project", true, 1),
                                        buildTag("Primavera", false, 2)
                                )),
                                buildSubCategory("Báo cáo", 2, Arrays.asList(
                                        buildTag("Weekly report", true, 1),
                                        buildTag("Biên bản", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "Kế toán công trình",
                        7,
                        Arrays.asList(
                                buildSubCategory("Hạch toán", 1, Arrays.asList(
                                        buildTag("Chi phí", true, 1),
                                        buildTag("Công nợ", false, 2)
                                ))
                        )
                ),
                buildCategory(
                        "Pháp lý xây dựng",
                        8,
                        Arrays.asList(
                                buildSubCategory("Giấy phép", 1, Arrays.asList(
                                        buildTag("Xin phép xây dựng", true, 1),
                                        buildTag("Hoàn công", false, 2)
                                ))
                        )
                )
        );

        categoryRepository.saveAll(categories);
        logger.info("Category Seeder completed. Seeded {} categories.", categories.size());
    }

    private Category buildCategory(String name, int displayOrder, List<SubCategory> subCategories) {
        Category category = Category.builder()
                .name(name)
                .displayOrder(displayOrder)
                .isActive(true)
                .build();

        for (SubCategory subCategory : subCategories) {
            category.addSubCategory(subCategory);
        }

        return category;
    }

    private SubCategory buildSubCategory(String name, int displayOrder, List<SubCategoryTag> tags) {
        SubCategory subCategory = SubCategory.builder()
                .name(name)
                .displayOrder(displayOrder)
                .isActive(true)
                .build();

        for (SubCategoryTag tag : tags) {
            subCategory.addTag(tag);
        }

        return subCategory;
    }

    private SubCategoryTag buildTag(String name, boolean isPopular, int displayOrder) {
        return SubCategoryTag.builder()
                .name(name)
                .isPopular(isPopular)
                .displayOrder(displayOrder)
                .isActive(true)
                .build();
    }
}
