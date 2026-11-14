using AutoMapper;

public class ListingProfile : Profile
{
    public ListingProfile()
    {
        CreateMap<Listing, ListingResponseDTO>();
        CreateMap<ListingRequestDTO, Listing>();
        CreateMap<ListingImage, ListingImageResponseDTO>();
        CreateMap<Amenity, AmenityResponseDTO>();
        CreateMap<RegionRequestDTO, Region>();
        CreateMap<ProfileFacts, ProfileFactsResponseDTO>();
        CreateMap<Review, ReviewResponseDTO>()
            .ForCtorParam(nameof(ReviewResponseDTO.AuthorName), option => option.MapFrom(review =>
                review.Author == null
                    ? "Анонімний користувач"
                    : string.IsNullOrWhiteSpace(review.Author.FirstName + " " + review.Author.LastName)
                        ? review.Author.Email
                        : (review.Author.FirstName + " " + review.Author.LastName).Trim()))
            .ForCtorParam(nameof(ReviewResponseDTO.AvatarUrl), option => option.MapFrom(review =>
                review.Author == null || string.IsNullOrWhiteSpace(review.Author.AvatarUrl)
                    ? null
                    : review.Author.AvatarUrl))
            .ForCtorParam(nameof(ReviewResponseDTO.AuthorInitial), option => option.MapFrom(review =>
                ReviewResponseDTO.GetAuthorInitial(review.Author)));
    }
}