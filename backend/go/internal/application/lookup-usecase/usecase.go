package lookup_usecase

import (
	"swd392-chatbot-rag/internal/domain/documentsource"
	"swd392-chatbot-rag/internal/domain/documenttype"
	"swd392-chatbot-rag/internal/domain/language"
	"swd392-chatbot-rag/internal/domain/lecturersubject"
	"swd392-chatbot-rag/internal/domain/subject"
	"swd392-chatbot-rag/internal/domain/user"
)

type LookupUseCase struct {
	subjectRepo subject.SubjectRepository
	typeRepo    documenttype.DocumentTypeRepository
	langRepo    language.LanguageRepository
	sourceRepo  documentsource.DocumentSourceRepository
	assignRepo  lecturersubject.AssignmentRepository
	userRepo    user.UserRepository
}

func NewLookupUseCase(
	subjectRepo subject.SubjectRepository, typeRepo documenttype.DocumentTypeRepository, langRepo language.LanguageRepository, sourceRepo documentsource.DocumentSourceRepository, assignRepo lecturersubject.AssignmentRepository, userRepo user.UserRepository,
) *LookupUseCase {
	return &LookupUseCase{
		subjectRepo: subjectRepo,
		typeRepo:    typeRepo,
		langRepo:    langRepo,
		sourceRepo:  sourceRepo,
		assignRepo:  assignRepo,
		userRepo:    userRepo,
	}
}
