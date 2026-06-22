package postgres

import (
	"context"
	"fmt"
	"strings"

	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DocumentRepository struct {
	pool *pgxpool.Pool
}

func NewDocumentRepository(pool *pgxpool.Pool) *DocumentRepository {
	return &DocumentRepository{pool: pool}
}

func (r *DocumentRepository) Create(ctx context.Context, doc *document.Document) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO documents (id, owner_user_id, title, description, subject_id, status, visibility, page_count, total_chunks, total_chapters, view_count, download_count, search_text, created_at, updated_at, approved_at, slug, document_type_id, language_id, md5_hash, academic_term_id, document_source_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
		doc.ID, doc.OwnerUserID, doc.Title, doc.Description, doc.SubjectID, doc.Status, doc.Visibility, doc.PageCount, doc.TotalChunks, doc.TotalChapters, doc.ViewCount, doc.DownloadCount, doc.SearchText, doc.CreatedAt, doc.UpdatedAt, doc.ApprovedAt, doc.Slug, doc.DocumentTypeID, doc.LanguageID, doc.Md5Hash, doc.AcademicTermID, doc.DocumentSourceID,
	)
	return err
}

func (r *DocumentRepository) FindByID(ctx context.Context, id uuid.UUID) (*document.Document, error) {
	var doc document.Document
	
	row := r.pool.QueryRow(ctx,
		`SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.academic_term_id, d.document_source_id,
		        s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, at.name as academic_term_name, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN academic_terms at ON d.academic_term_id = at.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		LEFT JOIN users u ON d.owner_user_id = u.id
		WHERE d.id = $1`, id,
	)

	err := row.Scan(
		&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.AcademicTermID, &doc.DocumentSourceID,
		&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.AcademicTermName, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

func (r *DocumentRepository) FindBySlug(ctx context.Context, slug string) (*document.Document, error) {
	var doc document.Document
	
	row := r.pool.QueryRow(ctx,
		`SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.academic_term_id, d.document_source_id,
		        s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, at.name as academic_term_name, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN academic_terms at ON d.academic_term_id = at.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		LEFT JOIN users u ON d.owner_user_id = u.id
		WHERE d.slug = $1`, slug,
	)

	err := row.Scan(
		&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.AcademicTermID, &doc.DocumentSourceID,
		&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.AcademicTermName, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

func (r *DocumentRepository) FindOwnedBySlug(ctx context.Context, slug string, ownerID uuid.UUID) (*document.Document, error) {
	var doc document.Document
	
	row := r.pool.QueryRow(ctx,
		`SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.academic_term_id, d.document_source_id,
		        s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, at.name as academic_term_name, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN academic_terms at ON d.academic_term_id = at.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		LEFT JOIN users u ON d.owner_user_id = u.id
		WHERE d.slug = $1 AND d.owner_user_id = $2`, slug, ownerID,
	)

	err := row.Scan(
		&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.AcademicTermID, &doc.DocumentSourceID,
		&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.AcademicTermName, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

func (r *DocumentRepository) FindAllPublic(ctx context.Context, params document.FilterParams, requesterID *uuid.UUID) ([]*document.Document, int, error) {
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(`
		SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.academic_term_id, d.document_source_id,
		       s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, at.name as academic_term_name, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		JOIN users u ON d.owner_user_id = u.id
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN academic_terms at ON d.academic_term_id = at.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		WHERE d.status IN ('completed', 'approved') AND (u.role_id = 1 OR u.role_id = 2) AND d.visibility <> 'private'
	`)

	var args []interface{}
	argIndex := 1

	if params.Query != nil && *params.Query != "" {
		q := "%" + *params.Query + "%"
		queryBuilder.WriteString(fmt.Sprintf(" AND (d.title ILIKE $%d OR s.name ILIKE $%d OR d.description ILIKE $%d)", argIndex, argIndex, argIndex))
		args = append(args, q)
		argIndex++
	}

	if params.SubjectID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.subject_id = $%d", argIndex))
		args = append(args, *params.SubjectID)
		argIndex++
	}

	if params.AcademicTermID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.academic_term_id = $%d", argIndex))
		args = append(args, *params.AcademicTermID)
		argIndex++
	}

	if params.DocumentTypeID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.document_type_id = $%d", argIndex))
		args = append(args, *params.DocumentTypeID)
		argIndex++
	}

	if params.LanguageID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.language_id = $%d", argIndex))
		args = append(args, *params.LanguageID)
		argIndex++
	}

	if params.DocumentSourceID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.document_source_id = $%d", argIndex))
		args = append(args, *params.DocumentSourceID)
		argIndex++
	}

	// Count Query
	countQueryStr := "SELECT COUNT(*) FROM (" + queryBuilder.String() + ") count_table"
	var total int
	err := r.pool.QueryRow(ctx, countQueryStr, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Order by
	sortBy := "date_desc"
	if params.SortBy != nil {
		sortBy = *params.SortBy
	}

	switch sortBy {
	case "title_asc":
		queryBuilder.WriteString(" ORDER BY d.title ASC")
	case "title_desc":
		queryBuilder.WriteString(" ORDER BY d.title DESC")
	case "date_asc":
		queryBuilder.WriteString(" ORDER BY d.created_at ASC")
	case "date_desc":
		queryBuilder.WriteString(" ORDER BY d.created_at DESC")
	case "views_asc":
		queryBuilder.WriteString(" ORDER BY d.view_count ASC")
	case "views_desc":
		queryBuilder.WriteString(" ORDER BY d.view_count DESC")
	default:
		queryBuilder.WriteString(" ORDER BY d.updated_at DESC")
	}

	// Pagination
	page := params.Page
	if page < 1 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize < 1 {
		pageSize = 6
	}
	offset := (page - 1) * pageSize
	queryBuilder.WriteString(fmt.Sprintf(" LIMIT %d OFFSET %d", pageSize, offset))

	rows, err := r.pool.Query(ctx, queryBuilder.String(), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var docs []*document.Document
	for rows.Next() {
		var doc document.Document
		err := rows.Scan(
			&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.AcademicTermID, &doc.DocumentSourceID,
			&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.AcademicTermName, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
		)
		if err != nil {
			return nil, 0, err
		}
		docs = append(docs, &doc)
	}

	return docs, total, nil
}

func (r *DocumentRepository) FindAllOwned(ctx context.Context, ownerID uuid.UUID, params document.FilterParams) ([]*document.Document, int, error) {
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(`
		SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.academic_term_id, d.document_source_id,
		       s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, at.name as academic_term_name, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		JOIN users u ON d.owner_user_id = u.id
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN academic_terms at ON d.academic_term_id = at.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		WHERE d.owner_user_id = $1
	`)

	args := []interface{}{ownerID}
	argIndex := 2

	if params.Query != nil && *params.Query != "" {
		q := "%" + *params.Query + "%"
		queryBuilder.WriteString(fmt.Sprintf(" AND (d.title ILIKE $%d OR s.name ILIKE $%d)", argIndex, argIndex))
		args = append(args, q)
		argIndex++
	}

	if params.SubjectID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.subject_id = $%d", argIndex))
		args = append(args, *params.SubjectID)
		argIndex++
	}

	if params.AcademicTermID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.academic_term_id = $%d", argIndex))
		args = append(args, *params.AcademicTermID)
		argIndex++
	}

	if params.DocumentTypeID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.document_type_id = $%d", argIndex))
		args = append(args, *params.DocumentTypeID)
		argIndex++
	}

	if params.LanguageID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.language_id = $%d", argIndex))
		args = append(args, *params.LanguageID)
		argIndex++
	}

	if params.DocumentSourceID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.document_source_id = $%d", argIndex))
		args = append(args, *params.DocumentSourceID)
		argIndex++
	}

	// Count Query
	countQueryStr := "SELECT COUNT(*) FROM (" + queryBuilder.String() + ") count_table"
	var total int
	err := r.pool.QueryRow(ctx, countQueryStr, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Order by
	sortBy := "date_desc"
	if params.SortBy != nil {
		sortBy = *params.SortBy
	}

	switch sortBy {
	case "title_asc":
		queryBuilder.WriteString(" ORDER BY d.title ASC")
	case "title_desc":
		queryBuilder.WriteString(" ORDER BY d.title DESC")
	case "date_asc":
		queryBuilder.WriteString(" ORDER BY d.created_at ASC")
	case "date_desc":
		queryBuilder.WriteString(" ORDER BY d.created_at DESC")
	case "views_asc":
		queryBuilder.WriteString(" ORDER BY d.view_count ASC")
	case "views_desc":
		queryBuilder.WriteString(" ORDER BY d.view_count DESC")
	default:
		queryBuilder.WriteString(" ORDER BY d.updated_at DESC")
	}

	// Pagination
	page := params.Page
	if page < 1 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize < 1 {
		pageSize = 6
	}
	offset := (page - 1) * pageSize
	queryBuilder.WriteString(fmt.Sprintf(" LIMIT %d OFFSET %d", pageSize, offset))

	rows, err := r.pool.Query(ctx, queryBuilder.String(), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var docs []*document.Document
	for rows.Next() {
		var doc document.Document
		err := rows.Scan(
			&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.AcademicTermID, &doc.DocumentSourceID,
			&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.AcademicTermName, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
		)
		if err != nil {
			return nil, 0, err
		}
		docs = append(docs, &doc)
	}

	return docs, total, nil
}

func (r *DocumentRepository) FindAllAdmin(ctx context.Context, params document.FilterParams) ([]*document.Document, int, error) {
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString(`
		SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.academic_term_id, d.document_source_id,
		       s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, at.name as academic_term_name, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		JOIN users u ON d.owner_user_id = u.id
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN academic_terms at ON d.academic_term_id = at.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		WHERE 1 = 1
	`)

	var args []interface{}
	argIndex := 1

	if params.Query != nil && *params.Query != "" {
		q := "%" + *params.Query + "%"
		queryBuilder.WriteString(fmt.Sprintf(" AND (d.title ILIKE $%d OR s.name ILIKE $%d OR s.code ILIKE $%d OR u.email ILIKE $%d OR u.name ILIKE $%d)", argIndex, argIndex, argIndex, argIndex, argIndex))
		args = append(args, q)
		argIndex++
	}

	if params.SubjectID != nil {
		queryBuilder.WriteString(fmt.Sprintf(" AND d.subject_id = $%d", argIndex))
		args = append(args, *params.SubjectID)
		argIndex++
	}

	// Count Query
	countQueryStr := "SELECT COUNT(*) FROM (" + queryBuilder.String() + ") count_table"
	var total int
	err := r.pool.QueryRow(ctx, countQueryStr, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Order
	queryBuilder.WriteString(" ORDER BY d.created_at DESC")

	// Pagination
	page := params.Page
	if page < 1 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize
	queryBuilder.WriteString(fmt.Sprintf(" LIMIT %d OFFSET %d", pageSize, offset))

	rows, err := r.pool.Query(ctx, queryBuilder.String(), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var docs []*document.Document
	for rows.Next() {
		var doc document.Document
		err := rows.Scan(
			&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.AcademicTermID, &doc.DocumentSourceID,
			&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.AcademicTermName, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
		)
		if err != nil {
			return nil, 0, err
		}
		docs = append(docs, &doc)
	}

	return docs, total, nil
}

func (r *DocumentRepository) ExistsByMd5(ctx context.Context, md5 string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM documents WHERE md5_hash = $1)", md5).Scan(&exists)
	return exists, err
}

func (r *DocumentRepository) Update(ctx context.Context, doc *document.Document) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE documents SET owner_user_id = $2, title = $3, description = $4, subject_id = $5, status = $6, visibility = $7, page_count = $8, total_chunks = $9, total_chapters = $10, view_count = $11, download_count = $12, search_text = $13, updated_at = $14, approved_at = $15, slug = $16, document_type_id = $17, language_id = $18, md5_hash = $19, academic_term_id = $20, document_source_id = $21
		WHERE id = $1`,
		doc.ID, doc.OwnerUserID, doc.Title, doc.Description, doc.SubjectID, doc.Status, doc.Visibility, doc.PageCount, doc.TotalChunks, doc.TotalChapters, doc.ViewCount, doc.DownloadCount, doc.SearchText, doc.UpdatedAt, doc.ApprovedAt, doc.Slug, doc.DocumentTypeID, doc.LanguageID, doc.Md5Hash, doc.AcademicTermID, doc.DocumentSourceID,
	)
	return err
}

func (r *DocumentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, "DELETE FROM documents WHERE id = $1", id)
	return err
}

func (r *DocumentRepository) CountByStatus(ctx context.Context, ownerID uuid.UUID, status string) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM documents WHERE owner_user_id = $1 AND status = $2", ownerID, status).Scan(&total)
	return total, err
}

func (r *DocumentRepository) CountFilesByOwner(ctx context.Context, ownerID uuid.UUID) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM document_files df JOIN documents d ON df.document_id = d.id WHERE d.owner_user_id = $1", ownerID).Scan(&total)
	return total, err
}

func (r *DocumentRepository) CountChunksByOwner(ctx context.Context, ownerID uuid.UUID) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM document_chunks dc JOIN documents d ON dc.document_id = d.id WHERE d.owner_user_id = $1", ownerID).Scan(&total)
	return total, err
}

func (r *DocumentRepository) CountFilesByDocument(ctx context.Context, docID uuid.UUID) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM document_files WHERE document_id = $1", docID).Scan(&total)
	return total, err
}

func (r *DocumentRepository) CountChunksByDocument(ctx context.Context, docID uuid.UUID) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM document_chunks WHERE document_id = $1", docID).Scan(&total)
	return total, err
}