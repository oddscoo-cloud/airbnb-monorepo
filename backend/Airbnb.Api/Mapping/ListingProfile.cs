using AutoMapper;

public class ListingProfile : Profile
{
    public ListingProfile()
    {
        CreateMap<Listing, ListingResponseDTO>();
        CreateMap<ListingRequestDTO, Listing>();
    }
}