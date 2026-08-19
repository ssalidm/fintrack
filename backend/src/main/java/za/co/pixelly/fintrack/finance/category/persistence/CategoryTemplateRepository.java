package za.co.pixelly.fintrack.finance.category.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.finance.category.domain.CategoryTemplate;

import java.util.List;

public interface CategoryTemplateRepository extends JpaRepository<CategoryTemplate, String> {

    List<CategoryTemplate> findAllByActiveTrueOrderByDisplayOrderAsc();
}
