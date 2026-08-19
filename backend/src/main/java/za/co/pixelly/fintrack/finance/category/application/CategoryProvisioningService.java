package za.co.pixelly.fintrack.finance.category.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryTemplate;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryTemplateRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryProvisioningService {

    private final CategoryRepository categoryRepository;
    private final CategoryTemplateRepository categoryTemplateRepository;

    @Transactional
    public void provisionDefaults(UUID userId) {
        List<CategoryTemplate> templates = categoryTemplateRepository
            .findAllByActiveTrueOrderByDisplayOrderAsc();

        Instant now = Instant.now();

        List<Category> categories = templates
            .stream()
            .filter(template ->
                !categoryRepository.existsByUserIdAndTemplateCode(
                    userId,
                    template.getCode()
                )
            )
            .map(template -> Category.createFromTemplate(
                    userId,
                    template,
                    now
                )
            )
            .toList();

        if (!categories.isEmpty()) {
            categoryRepository.saveAllAndFlush(categories);
        }
    }
}
