package za.co.pixelly.fintrack.finance.category.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository
    extends JpaRepository<Category, UUID> {

    Optional<Category> findByIdAndUserId(
        UUID id,
        UUID userId
    );

    Optional<Category> findByTemplateCodeAndUserId(
        String code,
        UUID userId
    );

    List<Category>
    findAllByUserIdAndStatusOrderByDisplayOrderAscNameAsc(
        UUID userId,
        CategoryStatus status
    );


    List<Category>
    findAllByUserIdAndCategoryTypeAndStatusOrderByDisplayOrderAscNameAsc(
        UUID userId,
        CategoryType categoryType,
        CategoryStatus status
    );


    @Query("""
        select count(category) > 0
        from Category category
        where category.userId = :userId
          and category.categoryType = :categoryType
          and category.status = :status
          and lower(trim(category.name))
                = lower(trim(:name))
        """)
    boolean existsByNormalizedName(
        @Param("userId")
        UUID userId,

        @Param("categoryType")
        CategoryType categoryType,

        @Param("name")
        String name,

        @Param("status")
        CategoryStatus status
    );


    @Query("""
        select count(category) > 0
        from Category category
        where category.userId = :userId
          and category.id <> :categoryId
          and category.categoryType = :categoryType
          and category.status = :status
          and lower(trim(category.name))
                = lower(trim(:name))
        """)
    boolean existsByNormalizedNameExcludingCategory(
        @Param("userId")
        UUID userId,

        @Param("categoryId")
        UUID categoryId,

        @Param("categoryType")
        CategoryType categoryType,

        @Param("name")
        String name,

        @Param("status")
        CategoryStatus status
    );

    boolean existsByUserIdAndTemplateCode(UUID userId, String templateCode);
}
