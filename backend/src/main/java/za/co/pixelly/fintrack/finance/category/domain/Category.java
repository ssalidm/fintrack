package za.co.pixelly.fintrack.finance.category.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "categories",
    schema = "finance"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
        name = "template_code",
        length = 50
    )
    private String templateCode;

    @Column(
        name = "name",
        nullable = false,
        length = 100
    )
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "category_type",
        nullable = false,
        length = 20
    )
    private CategoryType categoryType;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "status",
        nullable = false,
        length = 16
    )
    private CategoryStatus status;

    @Column(
        name = "display_order",
        nullable = false
    )
    private short displayOrder;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(
        name = "created_at",
        nullable = false
    )
    private Instant createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private Instant updatedAt;

    @Version
    @Column(
        name = "version",
        nullable = false
    )
    private long version;

    public static Category createFromTemplate(
        UUID userId,
        CategoryTemplate template,
        Instant now
    ) {
        Category category = new Category();

        category.userId = userId;
        category.templateCode = template.getCode();
        category.name = template.getName();
        category.categoryType = template.getCategoryType();
        category.status = CategoryStatus.ACTIVE;
        category.displayOrder = template.getDisplayOrder();
        category.archivedAt = null;
        category.createdAt = now;
        category.updatedAt = now;

        return category;
    }

    public static Category create(
        UUID userId,
        String name,
        CategoryType categoryType,
        short displayOrder,
        Instant now
    ) {
        Category category = new Category();

        category.userId = userId;
        category.templateCode = null;
        category.name = name;
        category.categoryType = categoryType;
        category.status = CategoryStatus.ACTIVE;
        category.displayOrder = displayOrder;
        category.archivedAt = null;
        category.createdAt = now;
        category.updatedAt = now;

        return category;
    }


    public void update(
        String name,
        CategoryType categoryType,
        Short displayOrder,
        Instant now
    ) {
        if (name != null) {
            this.name = name;
        }

        if (categoryType != null) {
            if (templateCode != null
                && categoryType != this.categoryType) {
                throw new TemplateCategoryTypeChangeException();
            }

            this.categoryType = categoryType;
        }

        if (displayOrder != null) {
            this.displayOrder = displayOrder;
        }

        this.updatedAt = now;
    }


    public void archive(Instant now) {
        this.status = CategoryStatus.ARCHIVED;
        this.archivedAt = now;
        this.updatedAt = now;
    }
}
